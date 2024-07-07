<?php

use Lib\Auth\Auth;

function logout()
{
    $auth = new Auth();
    $auth->logout();
    redirect('/');
}

?>

<div class="navbar">
    <div class="logo">
        <a href="/"><img src="<?php echo $baseUrl; ?>assets/images/Rijaja.png" width="125px"></a>
    </div>
    <nav>
        <ul id="MenuItems">
            <li><a href="/">Inicio</a></li>
            <li><a href="/products">Productos</a></li>
            <li><a href="">Acerca de</a></li>
            <li><a href="/contact">Contacto</a></li>
            <?php if ($auth->isAuthenticated()) : ?>
                <li><span><?= $userName ?></span></li>
                <li><button onclick="logout">Cerrar sesión</button></li>
            <?php else : ?>
                <li><a href="/account">Mi cuenta</a></li>
            <?php endif; ?>
        </ul>
    </nav>
    <a href="/cart"><img src="<?php echo $baseUrl; ?>assets/images/cart.png" width="30px" height="30px"></a>
    <img src="<?php echo $baseUrl; ?>assets/images/menu.png" onclick="menutoggle()" class="menu-icon">
</div>