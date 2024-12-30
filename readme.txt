Running Chrome

MacOS

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222 --user-data-dir="/Users/vtech/Library/Application Support/Google/Chrome"

Window

"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\Users\YourUsername\AppData\Local\Google\Chrome\User Data\DebuggingProfile"

Linux

google-chrome --no-sandbox --remote-debugging-port=9222 --user-data-dir="/home/your-username/.config/google-chrome"

+ User IDs
- 9736578480

http_proxy="http://43.152.113.55:2333"
https_proxy="http://43.152.113.55:2333"
ftp_proxy="http://43.152.113.55:2333"
no_proxy="localhost,127.0.0.1,::1"

export HTTP_PROXY=43.152.113.55:2333
export HTTPS_PROXY=43.152.113.55:2333
export FTP_PROXY=43.152.113.55:2333
export NO_PROXY=localhost,127.0.0.1,::1

curl -x http://u6e306302589f05ef-zone-custom:u6e306302589f05ef@43.152.113.55:2333 -I http://example.com