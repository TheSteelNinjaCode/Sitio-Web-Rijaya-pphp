<?php

use Lib\Prisma\Classes\Prisma;

$prisma = new Prisma();

$categories = $prisma->category->findMany([
    'take' => 3
], true);
$featuredProducts = $prisma->product->findMany([
    'take' => 4,
    'include' => ['ProductImage' => true],
], true);

$lastProducts = $prisma->product->findMany([
    'skip' => 4,
    'take' => 4,
    'include' => ['ProductImage' => true],
], true);

?>

<!------------------ featured categories --------------->
<div class="categories">
    <div class="small-container">
        <h2 class="title">Categorías Destacadas</h2>
        <div class="row">
            <?php foreach ($categories as $category) : ?>
                <div class="col-3">
                    <img src="<?php echo $baseUrl . $category->image ?>">
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>

<!-------------- Our Featured Products -------------->
<div class="small-container">
    <h2 class="title">Productos Destacados</h2>
    <div class="row">
        <?php foreach ($featuredProducts as $featuredProduct) : ?>
            <div class="col-4">
                <img src="<?php echo $baseUrl . $featuredProduct->ProductImage[0]->image; ?>"></a>
                <h4><a href="/products/<?= $featuredProduct->id ?>"><?= $featuredProduct->name ?></a></h4>
                <div class="rating">
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa <?php echo rand(0, 1) ? 'fa-star-half-o' : 'fa-star-o'; ?>"></i>
                </div>
                <p>$<?= $featuredProduct->price ?></p>
            </div>
        <?php endforeach; ?>
    </div>
    <h2 class="title">Últimos Productos</h2>
    <div class="row">
        <?php foreach ($lastProducts as $lastProduct) : ?>
            <div class="col-4">
                <img src="<?php echo $baseUrl . $lastProduct->ProductImage[0]->image; ?>">
                <h4><?= $lastProduct->name ?></h4>
                <div class="rating">
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa <?php echo rand(0, 1) ? 'fa-star-half-o' : 'fa-star-o'; ?>"></i>
                </div>
                <p>$<?= $lastProduct->price ?></p>
            </div>
        <?php endforeach; ?>
    </div>

</div>

<!----------offer--------------->
<div class="offer">
    <div class="small-container">
        <div class="row">
            <div class="col-2">
                <img src="<?php echo $baseUrl; ?>assets/images/silla az.png" class="offer-img">
            </div>
            <div class="col-2">
                <p>Disponible exclusivamente en Rijaya Comercial</p>
                <h1>Silla Gamer de Alta Gama</h1>
                <small>Confort, estilo y rendimiento para tus victorias más épicas.</small>
                <br>
                <a href="#" class="btn-2">Comprar ahora &#8594;
                    <span></span>
                    <span></span>
                </a>
            </div>
        </div>
    </div>

</div>

<!----------testimonial--------------->
<div class="testimonial">
    <div class="small-container">
        <div class="row">
            <div class="col-3">
                <i class="fa fa-quote-left"></i>
                <p>"¡Increíblemente útiles! Compré unos lockers para organizar nuestro almacén en la farmacia, y ha
                    hecho una gran diferencia en la eficiencia de nuestro espacio. Están bien construidos y son muy
                    funcionales. ¡Definitivamente los recomendaría!".</p>
                <div class="rating">
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star-o"></i>
                </div>
                <img src="<?php echo $baseUrl; ?>assets/images/user-1.png">
                <h3>María Parker</h3>
            </div>
            <div class="col-3">
                <i class="fa fa-quote-left"></i>
                <p>"Estamos encantados con nuestras nuevas sillas de aula. No solo son cómodas para los estudiantes,
                    sino que también son duraderas y fáciles de limpiar. Han mejorado significativamente el entorno
                    de aprendizaje en nuestras aulas. ¡Gracias!."</p>
                <div class="rating">
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star-o"></i>
                </div>
                <img src="<?php echo $baseUrl; ?>assets/images/user-2.png">
                <h3>Miguel Smith</h3>
            </div>
            <div class="col-3">
                <i class="fa fa-quote-left"></i>
                <p>"Nuestra oficina ha sido transformada gracias a los productos de almacenaje que adquirimos aquí,
                    todo ha sido de alta calidad. ¡Nos han ayudado a mantenernos organizados y a mejorar la estética
                    de nuestro espacio de trabajo!".</p>
                <div class="rating">
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star-o"></i>
                </div>
                <img src="<?php echo $baseUrl; ?>assets/images/user-3.png">
                <h3>Mabel Joe</h3>
            </div>
        </div>
    </div>
</div>

<!----------Brands--------------->
<div class="brands">
    <div class="small-container">
        <div class="row">
            <div class="col-5">
                <img src="<?php echo $baseUrl; ?>assets/images/myps.png">
            </div>
            <div class="col-5">
                <img src="<?php echo $baseUrl; ?>assets/images/kindemex.png">
            </div>
            <div class="col-5">
                <img src="<?php echo $baseUrl; ?>assets/images/Europlast.webp">
            </div>
            <div class="col-5">
                <img src="<?php echo $baseUrl; ?>assets/images/Sablon.png">
            </div>
            <div class="col-5">
                <img src="<?php echo $baseUrl; ?>assets/images/offiho-logo-2-1024x271.png">
            </div>
            <div class="col-5">
                <img src="<?php echo $baseUrl; ?>assets/images/fova.png">
            </div>
        </div>
    </div>
</div>