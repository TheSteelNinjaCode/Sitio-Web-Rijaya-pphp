<?php

use Lib\Prisma\Classes\Prisma;
use Lib\StateManager;

$prisma = new Prisma();
$state = new StateManager();

$page = $params->page ?? 1;
// $page = $state->getState('page', 1);
$perPage = 4;

$products = $prisma->product->findMany([
    'take' => $perPage,
    'skip' => ($page - 1) * $perPage,
    'orderBy' => 'name ASC',
    'select' => ['name' => true, 'price' => true, 'ProductImage' => true],
], true);

$totalProducts = $prisma->product->count();
$totalPages = ceil($totalProducts / $perPage);

function paginate($data)
{
    global $state;
    if (!empty($data->page) && is_numeric($data->page))
        $state->setState('page', $data->page);
}

?>

<?php require_once APP_PATH . '/_components/navbar.php'; ?>

<!----------------- title -------------->
<div class="small-container">
    <div class="row row-2">
        <h2>Todos los productos</h2>
        <select>
            <option>Listado predeterminado</option>
            <option>Lista por precio</option>
            <option>Lista por popularidad</option>
            <option>Lista por calificación</option>
            <option>Lista por venta</option>
        </select>
    </div>

    <div class="row">
        <?php foreach ($products as $product) : ?>
            <div class="col-4">
                <a href="<?= $pathname ?>/<?= $product->id ?>"><img src="<?php echo $baseUrl . $product->ProductImage[0]->image; ?>"></a>
                <h4><a href="<?= $pathname ?>/<?= $product->id ?>"><?= $product->name ?></a></h4>
                <div class="rating">
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star-o"></i>
                </div>
                <p>$<?= $product->price ?></p>
            </div>
        <?php endforeach; ?>
    </div>

    <div class="page-btn">
        <?php for ($i = 1; $i <= $totalPages; $i++) : ?>
            <a href="<?= $pathname . '?page=' . $i ?>"><span><?= $i ?></span></a>
            <!-- <span onclick="paginate({'page': '<?= $i ?>'})"><?= $i ?></span> -->
        <?php endfor; ?>
        <span href="<?= $pathname . '?page=' . $totalPages ?>">&#8594;</span>
        <!-- <span onclick="paginate({'page': '<?= $totalPages ?>'})">&#8594;</span> -->
    </div>
</div>