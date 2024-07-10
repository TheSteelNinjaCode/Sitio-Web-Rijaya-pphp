<?php

use Lib\Prisma\Classes\Prisma;
use Lib\Auth\Auth;
use Lib\Validator;

$prisma = new Prisma();
$auth = new Auth();

$userId = $auth->getPayload()->id ?? null;
$id = $dynamicRouteParams->id;
$product = null;
$relatedProducts = null;

if (!empty($id)) {
    $product = $prisma->product->findUnique([
        'where' => [
            'id' => $id
        ],
        'include' => ['ProductImage' => true, 'ProductCategory' => true],
    ], true);

    if ($product) {
        $relatedProducts = $prisma->productCategory->findMany([
            'where' => [
                'categoryId' => $product->ProductCategory[0]->categoryId,
                'NOT' => [
                    'productId' => $product->id
                ]
            ],
            'include' => ['product' => [
                'include' => [
                    'ProductImage' => true
                ]
            ]]
        ], true);
    } else {
        echo "Producto no encontrado";
    }
} else {
    echo "Producto no encontrado";
}

function addToCart($data)
{
    global $prisma, $userId, $id;

    if (empty($userId)) redirect('/account');

    $quantity = $data->quantity;
    if (!Validator::int($quantity))
        return 'La cantidad debe ser un número entero';

    try {
        $cart = $prisma->cart->findFirst([
            'where' => [
                'userId' => $userId,
                'payed' => false
            ]
        ], true);

        if (!$cart) {
            $prisma->cart->create([
                'data' => [
                    'userId' => $userId,
                    'items' => [
                        'create' => [
                            'productId' => $id,
                            'quantity' => $quantity
                        ]
                    ]
                ]
            ]);
        } else {
            $cartItem = $prisma->cartItem->findFirst([
                'where' => [
                    'cartId' => $cart->id,
                    'productId' => $id
                ]
            ], true);

            if ($cartItem) {
                $prisma->cartItem->update([
                    'where' => [
                        'id' => $cartItem->id
                    ],
                    'data' => [
                        'quantity' => $cartItem->quantity + $quantity
                    ]
                ]);
            } else {
                $prisma->cartItem->create([
                    'data' => [
                        'cartId' => $cart->id,
                        'productId' => $id,
                        'quantity' => $quantity
                    ]
                ]);
            }
        }
    } catch (\Exception $e) {
        echo $e->getMessage();
    }

    redirect('/cart');
}

?>

<div class="small-container single-product">
    <div class="row">
        <div class="col-2">
            <img src="<?php echo $baseUrl . $product->ProductImage[0]->image; ?>" width="100%" id="ProductImg">
            <div class="small-img-row">
                <?php
                $count = 0;
                foreach ($product->ProductImage as $ProductImage) :
                    if ($count >= 3) break;
                    $count++;
                ?>
                    <div class="small-img-col">
                        <img src="<?php echo $baseUrl . $ProductImage->image; ?>" class="small-img" width="100%">
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        <div class="col-2">
            <p><?= $product->description ?></p>
            <h1><?= $product->name ?></h1>
            <h4>$<?= $product->price ?></h4>

            <select>
                <option>Selecciona la medida</option>
                <option>150x130</option>
                <option></option>
                <option></option>
                <option></option>
                <option></option>
            </select>

            <form id="add-to-cart" onsubmit="addToCart">
                <input type="number" name="quantity" value="1">
            </form>
            <button form="add-to-cart" class="btn">Añadir al carrito
                <span></span>
                <span></span>
            </button>

            <h3>Detalles del producto<i class="fa fa-indent"></i></h3>
            <br>
            <p>Organiza tu espacio con estilo: ¡elige una gaveta hoy mismo!.</p>
        </div>
    </div>
</div>
<!----------------- title -------------->
<div class="small-container">
    <div class="row row-2">
        <h2>Productos relacionados</h2>
        <p>Ver más</p>
    </div>
</div>

<!-------------- Our Products -------------->
<div class="small-container">
    <div class="row">
        <?php
        $count = 0;
        foreach ($relatedProducts as $relatedProduct) :
            if ($count >= 3) break;
            $count++;
        ?>
            <div class="col-4">
                <img src="<?php echo $baseUrl . $relatedProduct->product[0]->ProductImage[0]->image; ?>">
                <h4><?= $relatedProduct->product[0]->name ?></h4>
                <div class="rating">
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa <?php echo rand(0, 1) ? 'fa-star-half-o' : 'fa-star-o'; ?>"></i>
                </div>
                <p>$<?= $relatedProduct->product[0]->price ?></p>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<script>
    //-------------Produc Gallery------------
    var ProductImg = document.getElementById("ProductImg");
    var SmallImg = document.getElementsByClassName("small-img");

    SmallImg[0].onclick = function() {
        ProductImg.src = SmallImg[0].src;
    }
    SmallImg[1].onclick = function() {
        ProductImg.src = SmallImg[1].src;

    }
    SmallImg[2].onclick = function() {
        ProductImg.src = SmallImg[2].src;

    }
    SmallImg[3].onclick = function() {
        ProductImg.src = SmallImg[3].src;

    }
    //-------------End Produc Gallery------------  
</script>