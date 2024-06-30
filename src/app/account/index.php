<?php

use Lib\Prisma\Classes\Prisma;
use Lib\Auth\Auth;
use Lib\StateManager;
use Lib\Validator;

$state = new StateManager();
$prisma = new Prisma();
$auth = new Auth();

if ($auth->isAuthenticated()) {
    redirect('/');
}

$message = $state->getState('message');
$username = $state->getState('username');
$email = $state->getState('email');
$password = $state->getState('password');

function loginUser($data)
{
    global $state, $prisma, $auth;

    $username = $data->username;
    $password = $data->password;

    $state->setState('username', $username);
    $state->setState('password', $password);

    if (!Validator::string($username)) {
        $state->setState('message', 'El nombre de usuario es requerido');
        return;
    }

    $user = $prisma->user->findFirst([
        'where' => ['name' => $username]
    ], true);

    if ($user) {
        if (password_verify($password, $user->password)) {
            $auth->authenticate($user);
            redirect('/');
        } else {
            $state->setState('message', 'Contraseña incorrecta');
        }
    } else {
        $state->setState('message', 'Usuario no encontrado');
    }
}

function registerUser($data)
{
    global $state, $prisma;

    $username = $data->username;
    $email = $data->email;
    $password = $data->password;

    $state->setState('username', $username);
    $state->setState('email', $email);
    $state->setState('password', $password);

    if (!Validator::string($username)) {
        $state->setState('message', 'El nombre de usuario es requerido');
        return;
    }

    if (!Validator::email($email)) {
        $state->setState('message', 'El correo electrónico es requerido');
        return;
    }

    if (!Validator::string($password)) {
        $state->setState('message', 'La contraseña es requerida');
        return;
    }

    $user = $prisma->user->findFirst([
        'where' => ['name' => $username]
    ], true);

    if ($user) {
        $state->setState('message', 'El nombre de usuario ya existe');
        return;
    }

    $user = $prisma->user->findUnique([
        'where' => ['email' => $email]
    ], true);

    if ($user) {
        $state->setState('message', 'El correo electrónico ya existe');
        return;
    }

    $user = $prisma->user->create([
        'data' => [
            'name' => $username,
            'email' => $email,
            'password' => password_hash($password, PASSWORD_DEFAULT),
            'userRole' => [
                'connect' => [
                    'name' => 'User'
                ],
            ],
        ]
    ]);

    if ($user) {
        $state->setState('username', '');
        $state->setState('email', '');
        $state->setState('password', '');
        $state->setState('message', 'Usuario registrado correctamente');
    } else {
        $state->setState('message', 'Error al registrar el usuario');
    }
}

?>

<div class="accout-page">
    <div class="container">

        <div class="row">

            <div class="col-2">
                <img src="<?php echo $baseUrl; ?>assets/images/silla az.png" width="80%">
            </div>

            <div class="col-2">
                <div class="form-container">
                    <div class="form-btn">
                        <span onclick="login()">Login</span>
                        <span onclick="register()">Register</span>
                        <hr id="indicator">
                    </div>

                    <form id="LoginForm" onsubmit="loginUser">
                        <span><?= $message ?></span> <!-- Ajustar el mensaje de error -->
                        <input type="text" name="username" placeholder="username" value="<?= $username ?>">
                        <input type="password" name="password" placeholder="Password" value="<?= $password ?>">
                        <button type="submit" class="btn">Login
                            <span></span>
                            <span></span>
                        </button>
                        <a href="/forgot-password">Forgot password</a>
                    </form>

                    <form id="RegForm" onsubmit="registerUser">
                        <span><?= $message ?></span> <!-- Ajustar el mensaje de error -->
                        <input type="text" name="username" placeholder="username" value="<?= $username ?>">
                        <input type="email" name="email" placeholder="Email" value="<?= $email ?>">
                        <input type="password" name="password" placeholder="Password" value="<?= $password ?>">
                        <button type="submit" class="btn">Register
                            <span></span>
                            <span></span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<!------------------- form toggle ----------->
<script>
    var LoginForm = document.getElementById("LoginForm");
    var RegForm = document.getElementById("RegForm");
    var Indicator = document.getElementById("indicator");

    function register() {
        RegForm.style.transform = "translateX(0px)";
        LoginForm.style.transform = "translateX(0px)";
        Indicator.style.transform = "translateX(100px)"
    };

    function login() {
        RegForm.style.transform = "translateX(300px)";
        LoginForm.style.transform = "translateX(300px)";
        Indicator.style.transform = "translateX(0px)"
    };
</script>