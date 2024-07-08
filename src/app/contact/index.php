<?php

use Lib\StateManager;
use Lib\PHPMailer\Mailer;
use Lib\Validator;
use Lib\Prisma\Classes\Prisma;

$state = new StateManager();

$errorMessage = $state->getState('errorMessage', ['status' => false, 'message' => '']);
$name = $state->getState('name');
$phone = $state->getState('phone');
$email = $state->getState('email');
$company = $state->getState('company');
$subject = $state->getState('subject');
$message = $state->getState('message');

function contact($data)
{
    global $state;

    $name = $data->name ?? '';
    $phone = $data->phone ?? '';
    $email = $data->email ?? '';
    $company = $data->company ?? '';
    $subject = $data->subject ?? '';
    $message = $data->message ?? '';

    foreach ($data as $key => $value) {
        $state->setState($key, $value);
    }

    if (!Validator::email($email) || !Validator::string($subject) || !Validator::string($message)) {
        $state->setState('errorMessage', ['status' => false, 'message' => 'Por favor, rellene los campos obligatorios.']);
        return;
    }

    $body = <<<EOT
              <h1>New message from $name</h1>
              <p>Phone: $phone</p>
              <p>Email: $email</p>
              <p>Company: $company</p>
              <p>Subject: $subject</p>
              <p>Message: $message</p>
          EOT;

    try {
        $mailer = new Mailer();
        if ($mailer->send($email, $subject, $body, ['name' => $name])) {

            $prisma = new Prisma();
            $prisma->contact->create([
                'data' =>
                [
                    'name' => $name,
                    'phone' => $phone,
                    'email' => $email,
                    'company' => $company,
                    'subject' => $subject,
                    'message' => $message
                ]
            ]);

            $state->setState('errorMessage', ['status' => true, 'message' => 'Email sent successfully.']);
            // Clear form data after successful email sending
            foreach (['name', 'phone', 'email', 'company', 'subject', 'message'] as $key) {
                $state->setState($key, '');
            }
        } else {
            $state->setState('errorMessage', ['status' => false, 'message' => 'Failed to send email.']);
        }
    } catch (Exception $e) {
        // Log the exception message (not shown here)
        $state->setState('errorMessage', ['status' => false, 'message' => 'An error occurred while sending email.']);
    }
}

?>

<main>
    <h1>Contáctenos</h1>
    <p>Contáctenos sobre cualquier cosa relacionada con nuestra empresa o servicios. Haremos todo lo posible
        por
        responderle a la brevedad.</p>
    <div class="contact-container">
        <form onsubmit="contact" pp-suspense="{'disabled': true}">
            <span style="<?= $errorMessage->status ? 'color: blue;' : 'color: red;' ?>" pp-hidden="20s"><?= $errorMessage->message ?></span>
            <div>
                <label for="name">Nombre:</label>
                <input type="text" id="name" name="name" value="<?= $name ?>">
            </div>
            <div>
                <label for="phone">Número de teléfono:</label>
                <input type="tel" id="phone" name="phone" value="<?= $phone ?>">
            </div>
            <div>
                <label for="email">Correo electrónico:</label>
                <input type="email" id="email" name="email" value="<?= $email ?>" required>
            </div>
            <div>
                <label for="company">Empresa:</label>
                <input type="text" id="company" name="company" value="<?= $company ?>">
            </div>
            <div>
                <label for="subject">Asunto:</label>
                <input type="text" id="subject" name="subject" value="<?= $subject ?>" required>
            </div>
            <div>
                <label for="message">Pregunta:</label>
                <textarea id="message" name="message" rows="4" required><?= $message ?></textarea>
            </div>
            <div>
                <button class="btn" pp-suspense="Sending...">Enviar
                    <span></span>
                    <span></span>
                </button>
            </div>
        </form>
        <div class="map-container">
            <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d60342.373090967325!2d-98.105246!3d19.046217!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85cfeaf1d49e3e8f%3A0x62375ba6d0a43b7!2sRijaya!5e0!3m2!1ses-419!2smx!4v1720222945487!5m2!1ses-419!2smx" width="400" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>

            <div class="map-container-2">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.6423283367026!2d-98.20691432391021!3d19.035476182160686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85cfc0c3fcf87b53%3A0xd395e51cd3632efc!2sRijaya%20Comercial%20S.A.%20de%20C.V.!5e0!3m2!1ses-419!2smx!4v1720295341160!5m2!1ses-419!2smx" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
        </div>
</main>