<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>您的账号已审核通过</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            color: #667eea;
            margin-top: 0;
        }
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
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
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
        .button {
            display: inline-block;
            background-color: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: 500;
        }
        .button:hover {
            background-color: #5568d3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 恭喜！您的账号已审核通过</h1>
        </div>
        <div class="content">
            <h2>欢迎加入我们的积分管理系统</h2>

            <p>亲爱的 <strong>{{ $userName }}</strong>：</p>

            <p>我们很高兴地通知您，您的账号注册申请已经通过审核！现在您可以使用系统的所有功能了。</p>

            <div class="info-box">
                <p><span class="info-label">审核人：</span>{{ $reviewerName }}</p>
                <p><span class="info-label">审核时间：</span>{{ $reviewDate }}</p>
            </div>

            <p>您现在可以：</p>
            <ul style="margin-top: 10px;">
                <li>查看您的积分余额和历史记录</li>
                <li>在积分商城兑换商品</li>
                <li>参与各种活动获取积分</li>
            </ul>

            <a href="{{ config('app.url') }}/login" class="button">立即登录</a>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
                如果您有任何问题，请随时联系我们的客服团队。
            </p>
        </div>
        <div class="footer">
            <p>这是一封自动发送的邮件，请勿回复。</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. 保留所有权利。</p>
        </div>
    </div>
</body>
</html>
