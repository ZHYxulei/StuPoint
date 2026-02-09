<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>您的账号审核未通过</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .content h2 {
            color: #dc3545;
            margin-top: 0;
        }
        .info-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box p {
            margin: 5px 0;
        }
        .info-label {
            font-weight: 600;
            color: #555;
        }
        .reason-box {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ 您的账号审核未通过</h1>
        </div>
        <div class="content">
            <h2>很遗憾，您的注册申请未能通过审核</h2>

            <p>亲爱的 <strong>{{ $userName }}</strong>：</p>

            <p>我们遗憾地通知您，您的账号注册申请未能通过审核。</p>

            <div class="reason-box">
                <p style="margin: 0;"><strong>拒绝原因：</strong>{{ $reason }}</p>
            </div>

            <div class="info-box">
                <p><span class="info-label">审核人：</span>{{ $reviewerName }}</p>
                <p><span class="info-label">审核时间：</span>{{ $reviewDate }}</p>
            </div>

            <p><strong>下一步操作：</strong></p>
            <ul style="margin-top: 10px;">
                <li>请仔细阅读拒绝原因</li>
                <li>如需重新申请，请联系相关审核人员</li>
                <li>如有疑问，请联系管理员</li>
            </ul>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
                如果您认为这是一个错误，或者需要更多信息，请联系我们的客服团队。
            </p>
        </div>
        <div class="footer">
            <p>这是一封自动发送的邮件，请勿回复。</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. 保留所有权利。</p>
        </div>
    </div>
</body>
</html>
