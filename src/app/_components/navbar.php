<div class="container">
    <div class="navbar">
        <div class="logo">
            <a href="/"><img src="<?php echo $baseUrl; ?>assets/images/Rijaja.png" width="125px"></a>
        </div>
        <nav>
            <ul id="MenuItems">
                <li><a href="/">Inicio</a></li>
                <li><a href="/products">Productos</a></li>
                <li><a href="/acerca-de">Acerca de</a></li>
                <li><a href="/contacto">Contacto</a></li>
                <li><a href="/account">Cuenta</a></li>
            </ul>
        </nav>
        <a href="/cart"><img src="<?php echo $baseUrl; ?>assets/images/cart.png" width="30px" height="30px"></a>
        <img src="<?php echo $baseUrl; ?>assets/images/menu.png" onclick="menutoggle()" class="menu-icon">
    </div>
    <?php if ($pathname === '/') : ?>
        <div class="row">
            <div class="col-2">

                <h1>QUIENES SOMOS:<br>experiencia y servicio al cliente</h1>
                <p>Somos una empresa orgullosamente mexicana, que cuenta con más de 15 años de experiencia en el
                    sector industrial y comercial. RIJAYA COMERCIAL ofrece las mejores soluciones de almacenaje,
                    mobiliario de oficina y muebles para exhibición.</p><br>

                <p>Nuestros productos son sinónimo de calidad y nuestro excelente servicio asegura el éxito de tu
                    empresa o negocio.</p><br>

                <p>Con el desarrollo constante de opciones innovadoras y eficientes diseñamos espacios que
                    proporcionan un mejor desempeño al exhibir, producir, operar y guardar.</p><br>

                <a href="#" class="btn">Ver más &#8594;
                    <span></span>
                    <span></span>
                </a>
            </div>
            <div class="col-2">
                <img src="<?php echo $baseUrl; ?>assets/images/silla az.png">
            </div>
        </div>
    <?php endif; ?>
</div>

<!-------------js for toggle menu-------------->
<script>
    var MenuItems = document.getElementById("MenuItems");

    MenuItems.style.maxHeight = "0px";

    function menutoggle() {
        if (MenuItems.style.maxHeight == "0px") {
            MenuItems.style.maxHeight = "200px";
        } else {
            MenuItems.style.maxHeight = "0px"
        }
    }
</script>