// Additional libraries:
//   https://cdn.jsdelivr.net/npm/qrcode@1/build/qrcode.min.js
//   https://cdn.jsdelivr.net/npm/otpauth@8/dist/otpauth.umd.min.js

var auth = null;
function $id(x) {
  return document.getElementById(x);
}
function urlencode(x) {
  return x.replace(/ /g, '%20');
}
function updateCode() {
  if (!auth) return;
  var time = Date.now()/1000;
  var timeleft = (30 - time % 30);
  //console.log(timeleft);
  var code = auth.generate(time);
  if ($id('totp_code').textContent !== code)
    $id('totp_code').textContent = code;
  $id('totp_timer').style.width = (4 * (timeleft)) + 'px'
}
function updateAuth(event) {
  var sn = $id('totp_sn').value || $id('totp_sn').placeholder;
  var acc = $id('totp_acc').value || $id('totp_acc').placeholder;
  var key = ($id('totp_key').value || $id('totp_key').placeholder).toUpperCase().replace(/[^A-Z0-9]/g, '');
  var url = 'otpauth://totp/' + urlencode(sn) + ':' + urlencode(acc) + '?secret=' + key + '&issuer=' + urlencode(sn);
  $id('totp_url').value = url;
  QRCode.toDataURL(url,
    { errorCorrectionLevel:'L', scale: 5, },
    function (err, dataurl) {
      if (err) return console.error(err);
      var img = new Image();
      img.src = dataurl;
      img.onload = function() {
        var link = $id('totp_link');
        link.innerHTML = '';
        link.appendChild(img);
        link.setAttribute('download', sn + ' (' + acc + ').png');
        link.href = dataurl;
      }
    }
  )
  auth = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(key),
  });
  updateCode();
}
updateAuth();
document.addEventListener('keydown', updateAuth);
document.addEventListener('keyup', updateAuth);
document.addEventListener('change', updateAuth);
document.addEventListener('paste', updateAuth);
setInterval(updateCode, 250);