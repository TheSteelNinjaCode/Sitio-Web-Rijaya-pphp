<?php

function loginUser($data)
{
    return $data;
}

function registerUser($data)
{
    return $data;
}

?>


<?php require_once APP_PATH . '/_components/navbar.php'; ?>

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
                        <input type="text" name="name" placeholder="username">
                        <input type="password" name="password" placeholder="Password">
                        <button type="submit" class="btn">Login
                            <span></span>
                            <span></span>
                        </button>
                        <a href="/forgot-password">Forgot password</a>
                    </form>

                    <form id="RegForm" onsubmit="registerUser">
                        <input type="text" name="name" placeholder="username">
                        <input type="email" name="email" placeholder="Email">
                        <input type="password" name="password" placeholder="Password">
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