<?php require_once APP_PATH . '/_components/navbar.php' ?>

<!--------------Cart Items details--------------->
<div class="small-container cart-page">

    <table>
        <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
        </tr>

        <tr>
            <td>
                <div class="cart-info">
                    <img src="<?php echo $baseUrl; ?>assets/Productos/Muebles de almacenaje/GAVETA_1_EUROPLAST_AZUL.png">
                    <div>
                        <p>Gaveta 1 europlast</p>
                        <small>Precio: $50.00</small><br>
                        <a href="">Eliminar</a>
                    </div>
                </div>
            </td>
            <td><input type="number" value="1"></td>
            <td>$50.00</td>
        </tr>
        <tr>
            <td>
                <div class="cart-info">
                    <img src="<?php echo $baseUrl; ?>assets/Productos/Muebles de almacenaje/ESTANTE_AEROSOLES.png">
                    <div>
                        <p>Estante aerosoles</p>
                        <small>Precio: $75.00</small><br>
                        <a href="">Eliminar</a>
                    </div>
                </div>
            </td>
            <td><input type="number" value="1"></td>
            <td>$75.00</td>
        </tr>
        <tr>
            <td>
                <div class="cart-info">
                    <img src="<?php echo $baseUrl; ?>assets/Productos/Muebles de almacenaje/CAJA_BAMBA_O.png">
                    <div>
                        <p>Caja bamba'o</p>
                        <small>Precio: $75.00</small><br>
                        <a href="">Eliminar</a>
                    </div>
                </div>
            </td>
            <td><input type="number" value="1"></td>
            <td>$75.00</td>
        </tr>
    </table>

    <div class="total-price">
        <table>
            <tr>
                <td>Subtotal</td>
                <td>$200.00</td>
            </tr>
            <tr>
                <td>Impuesto</td>
                <td>$35.00</td>
            </tr>
            <tr>
                <td>Total</td>
                <td>$235.00</td>
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