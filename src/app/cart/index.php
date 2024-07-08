<?php

use Lib\Prisma\Classes\Prisma;
use Lib\Auth\Auth;
use Lib\StateManager;

$prisma = new Prisma();
$auth = new Auth();
$state = new StateManager();

$userId = $auth->getPayload()->id ?? null;

$cartItems = $prisma->cart->findMany([
    'where' => [
        'userId' => $userId
    ],
    'include' => [
        'items' => [
            'include' => [
                'product' => true
            ]
        ]
    ]
], true);

$products = [];
foreach ($cartItems as $cart) {
    if (isset($cart->items) && is_array($cart->items)) {
        foreach ($cart->items as $item) {
            $product = $item->product[0];
            $productImage = $prisma->productImage->findFirst([
                'where' => [
                    'productId' => $item->productId
                ]
            ], true);
            $products[] = array_merge((array)$product, ['quantity' => $item->quantity, 'itemId' => $item->id], ['image' => $productImage->image]);
        }
    }
}

$subtotal = 0;
$taxRate = 0.175; // For example, 17.5% tax

foreach ($products as $product) {
    $subtotal += $product['price'] * $product['quantity'];
}

$tax = $subtotal * $taxRate;
$total = $subtotal + $tax;

function removeProduct($data)
{
    // return $data;
    global $prisma;
    $prisma->cartItem->delete([
        'where' => [
            'id' => $data->itemId,
        ]
    ]);
}

?>

<div class="small-container cart-page">
    <table>
        <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
        </tr>
        <?php foreach ($products as $product) : ?>
            <tr id="<?= $product['id'] ?>">
                <td>
                    <div class="cart-info">
                        <img src="<?php echo $baseUrl . $product['image']; ?>">
                        <div>
                            <p><?php echo $product['name']; ?></p>
                            <small>Precio: $<?php echo $product['price']; ?></small><br>
                            <button onclick="removeProduct({'itemId': '<?= $product['itemId'] ?>'})">Eliminar</button>
                        </div>
                    </div>
                </td>
                <td><input type="number" value="<?= $product['quantity'] ?>"></td>
                <td>$<?php echo number_format($product['price'] * $product['quantity'], 2); ?></td>
            </tr>
        <?php endforeach; ?>
    </table>

    <div class="total-price">
        <table>
            <tr>
                <td>Subtotal</td>
                <td>$<?php echo number_format($subtotal, 2); ?></td>
            </tr>
            <tr>
                <td>Impuesto</td>
                <td>$<?php echo number_format($tax, 2); ?></td>
            </tr>
            <tr>
                <td>Total</td>
                <td>$<?php echo number_format($total, 2); ?></td>
            </tr>
        </table>
    </div>
    <div class="total-price">
        <a href="#" class="btn">Proceder al pago &#8594;
            <span></span>
            <span></span>
        </a>
    </div>
</div>