<?php
/**
 * Contact Form Handler for Waarheid Marketing
 * Processes form submissions and sends emails
 */

// Security headers
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Configuration
$to_email = 'info@waarheidmarketing.com'; // Change this to your actual email
$from_email = 'noreply@waarheidmarketing.com';
$from_name = 'Waarheid Marketing Website';

// Get and sanitize form data
$name = isset($_POST['name']) ? sanitize_input($_POST['name']) : '';
$email = isset($_POST['email']) ? filter_var($_POST['email'], FILTER_SANITIZE_EMAIL) : '';
$phone = isset($_POST['phone']) ? sanitize_input($_POST['phone']) : '';
$service = isset($_POST['service']) ? sanitize_input($_POST['service']) : '';
$message = isset($_POST['message']) ? sanitize_input($_POST['message']) : '';

// Validation
$errors = [];

if (empty($name)) {
    $errors[] = 'Name is required';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Valid email is required';
}

if (empty($service)) {
    $errors[] = 'Please select a service';
}

if (empty($message)) {
    $errors[] = 'Message is required';
}

// Check for spam (honeypot field)
if (!empty($_POST['website'])) {
    // This field should be empty (hidden from real users)
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Spam detected']);
    exit;
}

// Return errors if any
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
    exit;
}

// Prepare email
$subject = 'New Contact Form Submission from Waarheid Marketing Website';

$email_body = "
New Contact Form Submission

Name: $name
Email: $email
Phone: $phone
Service Interested In: $service

Message:
$message

---
Submitted: " . date('Y-m-d H:i:s') . "
IP Address: " . get_client_ip() . "
";

// Email headers
$headers = [
    'From: ' . $from_name . ' <' . $from_email . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'X-Mailer: PHP/' . phpversion(),
    'Content-Type: text/plain; charset=UTF-8'
];

// Send email
$mail_sent = mail($to_email, $subject, $email_body, implode("\r\n", $headers));

if ($mail_sent) {
    // Log the submission (optional)
    log_submission($name, $email, $service);

    // Send auto-reply to user
    send_auto_reply($email, $name);

    echo json_encode([
        'success' => true,
        'message' => 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Sorry, there was an error sending your message. Please try again or email us directly.'
    ]);
}

/**
 * Sanitize user input
 */
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

/**
 * Get client IP address
 */
function get_client_ip() {
    $ip = '';
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : 'Unknown';
}

/**
 * Log submission to file (optional)
 */
function log_submission($name, $email, $service) {
    $log_file = __DIR__ . '/logs/contact-submissions.log';
    $log_dir = dirname($log_file);

    // Create logs directory if it doesn't exist
    if (!is_dir($log_dir)) {
        mkdir($log_dir, 0755, true);
    }

    $log_entry = date('Y-m-d H:i:s') . " | $name | $email | $service\n";
    file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
}

/**
 * Send auto-reply to user
 */
function send_auto_reply($to_email, $name) {
    $subject = 'Thank you for contacting Waarheid Marketing';

    $message = "
Dear $name,

Thank you for reaching out to Waarheid Marketing!

We've received your message and one of our team members will get back to you within 24 hours.

In the meantime, feel free to explore our services:
- Marketing & Branding
- Web & App Development
- Automation & Business Intelligence

Best regards,
The Waarheid Marketing Team

---
Waarheid Marketing
Marketing & Digitalization Agency
Email: info@waarheidmarketing.com
Website: https://waarheidmarketing.com
";

    $headers = [
        'From: Waarheid Marketing <noreply@waarheidmarketing.com>',
        'Content-Type: text/plain; charset=UTF-8'
    ];

    mail($to_email, $subject, $message, implode("\r\n", $headers));
}
?>