<?php

use Lib\Auth\Auth;

$auth = new Auth();

$userName = $auth->getPayload()->name ?? '';

?>

<?php if ($pathname === '/') : ?>
    <div class="header">
        <div class="container">
            <?php require_once APP_PATH . '/_components/shared-navbar.php'; ?>
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
        </div>
    </div>
<?php else : ?>
    <div class="container">
        <?php require_once APP_PATH . '/_components/shared-navbar.php'; ?>
    </div>
<?php endif; ?>

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