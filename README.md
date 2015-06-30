# ajaxfileuploader.js

----
## description

Upload file/files by ajax

## compatible
  Single file upload:
  ```
  IE 6+
  Chrome ALL
  Firefox ALL
  Safari ALL
  ```

Multiple file upload
  ```
  IE 10+
  Chrome 31+
  Firefox 31+
  Safari 7+
  ```

Screenshot/Copy Paste file upload
  ```
  IE not support
  Chrome 31+
  Firefox not support
  Safari not support
  ```


## usage
```JavaScript
$('input#choose-file').uploader({
    url: '/file/',
    data: {_csrf_token: '9r/TByp2HxEsGoSfr5WIzDMmTKppj62J2QfbAvcJfn4='},
    secureuri: true,
    fileElementId: 'choose-file',
    filedName: 'file',
    dataType: 'json',
    minSize: 1,
    maxSize: 5*1024*1024,
    beforeUpload: function(file, nonce){
        $('#rs').show();
        $('.rs-top').append('<div class="fileitem" id="i-'+nonce+'"><span class="filename" id="n-'+nonce+'">:</span> <a id="a-'+nonce+'" href="" class="filelink" target="_blank">上传中...</a><a id="rs-close" onclick="$(\'#i-'+nonce+'\').remove();">&times;</a></div>');
        $('#n-'+nonce).attr('title',file.name).text(file.name.length>20?file.name.substr(0,12)+'....'+file.name.split('.').reverse()[1].split('').reverse()[0]+'.'+file.name.split('.').reverse()[0]:file.name);
    },
    success: function(json, nonce){
        if(json.head.statusCode==0) {
            $('#a-'+nonce).text(json.body.url).attr('href',json.body.url);
        }else{
            $('#a-'+nonce).text(json.head.note).attr('href','');
        }
    },
    error: function(file, nonce, msg){
        $('#a-'+nonce).text(msg);
    }
});
```
