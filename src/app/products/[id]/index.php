<?php

use Lib\Prisma\Classes\Prisma;

$prisma = new Prisma();

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
        echo '=====================relatedProducts<br>';
        $relatedProducts = $prisma->productCategory->findMany([
            'where' => [
                'categoryId' => $product->ProductCategory[0]->categoryId,
                'NOT' => [
                    'productId' => $product->id
                ]
            ],
            'include' => ['product' => [
                'select' => [
                    'ProductImage' => true
                ]
            ]]
        ], true);

        echo '<pre>';
        print_r($relatedProducts);
        echo '</pre>';
    } else {
        echo "Producto no encontrado";
        exit;
    }
} else {
    echo "Producto no encontrado";
    exit;
}
?>

<?php require_once APP_PATH . '/_components/navbar.php'; ?>

<!--------------single-product--------------->
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

            <input type="number" value="1">
            <a href="/cart" class="btn">Añadir al carrito
                <span></span>
                <span></span>
            </a>

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
                    <i class="fa fa-star-o"></i>
                </div>
                <p>$<?= $relatedProduct->product[0]->price ?></p>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<!-------------js for toggle menu-------------->
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