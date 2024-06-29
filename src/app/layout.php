<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?php echo htmlspecialchars($metadata['description']); ?>">
    <title><?php echo htmlspecialchars($metadata['title']); ?></title>
    <link rel="shortcut icon" href="<?php echo $baseUrl; ?>favicon.ico" type="image/x-icon">
    <script>
        var baseUrl = '<?php echo $baseUrl; ?>';
        var pathname = '<?php echo $pathname; ?>';
    </script>
    <link href="<?php echo $baseUrl; ?>css/index.css" rel="stylesheet">
    <script src="<?php echo $baseUrl; ?>js/index.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
</head>

<body>
    <!-- Additional HTML content can go here. -->
    <?php echo $content; ?>
    <?php require_once APP_PATH . '/_components/footer.php'; ?>
    <!-- Additional HTML content can go here. -->
</body>

</html>