<?php

use Lib\Prisma\Classes\Prisma;
use Lib\Auth\Auth;
use Lib\StateManager;
use Lib\Validator;

$prisma = new Prisma();
$auth = new Auth();
$state = new StateManager();

$userId = $auth->getPayload()->id ?? null;
$subtotal = 0;
$taxRate = 0.175; // For example, 17.5% tax

$cartItems = $prisma->cart->findMany([
    'where' => [
        'userId' => $userId,
        'payed' => false
    ],
    'include' => [
        'items' => [
            'include' => [
                'product' => [
                    'include' => [
                        'ProductImage' => true
                    ]
                ]
            ]
        ]
    ]
], true);

$products = [];
foreach ($cartItems as $cart) {
    if (isset($cart->items) && is_array($cart->items)) {
        foreach ($cart->items as $item) {
            $product = $item->product[0];
            $products[] = array_merge((array)$product, ['quantity' => $item->quantity, 'itemId' => $item->id], ['image' => $product->ProductImage[0]->image ?? '']);
        }
    }
}

foreach ($products as $product) {
    $subtotal += $product['price'] * $product['quantity'];
}

$tax = $subtotal * $taxRate;
$total = $subtotal + $tax;

function removeProduct($data)
{
    global $prisma;
    $prisma->cartItem->delete([
        'where' => [
            'id' => $data->itemId,
        ]
    ]);
}

function updateQuantity($data)
{
    global $prisma;

    if (!Validator::int($data->quantity))
        return 'La cantidad debe ser un número entero';

    $prisma->cartItem->update([
        'where' => [
            'id' => $data->itemId,
        ],
        'data' => [
            'quantity' => $data->quantity,
        ]
    ]);
}

function payInvoice()
{
    global $prisma, $userId;

    $cart = $prisma->cart->findFirst([
        'where' => [
            'userId' => $userId,
            'payed' => false
        ]
    ], true);

    $prisma->cart->update([
        'where' => [
            'id' => $cart->id
        ],
        'data' => [
            'payed' => true
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
                            <button onclick="removeProduct({'itemId': '<?= $product['itemId'] ?>'})" pp-suspense="Eliminando...">Eliminar</button>
                        </div>
                    </div>
                </td>
                <td><input id="<?= $product['itemId'] ?>" oninput="updateQuantity({'itemId': '<?= $product['itemId'] ?>'})" type="number" name="quantity" value="<?= $product['quantity'] ?>" autocomplete="false"></td>
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
        <button onclick="payInvoice" class="btn" pp-suspense="Pagando...">Proceder al pago &#8594;
            <span></span>
            <span></span>
        </button>
    </div>
</div>