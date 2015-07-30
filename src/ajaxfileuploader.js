/**
 * ajaxfileuploader.js
 * @author          xiaohui.lam(xiaohui.lam#icloud.com)
 * @description     ajax_upload_file
 * @usage           #usage
 */

/**
    $('input#file-input').uploader({
        url: '/file/',
        data: {_csrf_token: '....'},
        secureuri: true,
        fileElementId: 'file-input',
        filedName: 'file',
        dataType: 'json',
        minSize: 1,
        maxSize: 5*1024*1024,
        allowExt: {
            jpg: 1,
            png: 1,
            gif: 1,
            jpeg: 1,
            bmp: 1,
            ico: 1,
            webp: 1
        }
        beforeUpload: function(file, nonce){
            console.log(file);
            console.log(nonce);
        },
        success: function(json, nonce){
            console.log(json);
            console.log(nonce);
        },
        error: function(file, nonce, msg){
            console.log(file);
            console.log(nonce);
            console.log(msg);
        }
    });
 */

(function(window, $){
    if("undefined"==typeof $.handleError)$.handleError=function(a){return false;}
    $.extend({
        createUploadIframe: function(id, uri) {
            var frameId = 'jUploadFrame' + id;
            var iframeHtml = '<iframe id="' + frameId + '" name="' + frameId + '" style="position:absolute; top:-9999px; left:-9999px"';
            if (window.ActiveXObject) {
                if (typeof uri == 'boolean') {
                    iframeHtml += ' src="' + 'javascript:false' + '"'
                } else if (typeof uri == 'string') {
                    iframeHtml += ' src="' + uri + '"'
                }
            }
            iframeHtml += ' />';
            $(document.body).append($(iframeHtml));
            return $('#' + frameId).get(0)
        },
        createUploadForm: function(id, fileElementId, data) {
            var formId = 'jUploadForm' + id;
            var fileId = 'jUploadFile' + id;
            var form = $('<form  action="" method="POST" name="' + formId + '" id="' + formId + '" enctype="multipart/form-data"></form>');
            if (data) {
                for (var i in data) {
                    $('<input type="hidden" name="' + i + '" value="' + data[i] + '" />').appendTo(form)
                }
            }
            var oldElement = $('#' + fileElementId);
            var newElement = $(oldElement).clone();
            $(oldElement).attr('id', fileId);
            $(oldElement).before(newElement);
            $(oldElement).appendTo(form);
            $(form).css('position', 'absolute');
            $(form).css('top', '-1200px');
            $(form).css('left', '-1200px');
            $(document.body).append($(form));
            return form
        },
        ajaxFileUpload: function(s, e, ex) {
            s = $.extend({}, $.ajaxSettings, s);
            if ("undefined" === s.filedName) s.filedName = s.fileElementId;
            var id = (new Date().getTime()).toString() + parseInt(Math.random() * 9999999).toString();
            var frameId = 'jUploadFrame' + id;
            var formId = 'jUploadForm' + id;
            var requestDone = false;
            if (!("undefined" !== typeof e && "undefined" !== typeof e.target && "undefined" !== typeof e.target.files)) {
                var form = $.createUploadForm(id, s.fileElementId, (typeof(s.data) == 'undefined' ? false : s.data));
                var io = $.createUploadIframe(id, s.secureuri);
                if (s.global && !$.active++) {
                    $.event.trigger("ajaxStart")
                }
                var xml = {}
                if (s.global) $.event.trigger("ajaxSend", [xml, s]);
                var uploadCallback = function(isTimeout) {
                        var io = document.getElementById(frameId);
                        try {
                            if (io.contentWindow) {
                                xml.responseText = io.contentWindow.document.body ? io.contentWindow.document.body.innerHTML : null;
                                xml.responseXML = io.contentWindow.document.XMLDocument ? io.contentWindow.document.XMLDocument : io.contentWindow.document
                            } else if (io.contentDocument) {
                                xml.responseText = io.contentDocument.document.body ? io.contentDocument.document.body.innerHTML : null;
                                xml.responseXML = io.contentDocument.document.XMLDocument ? io.contentDocument.document.XMLDocument : io.contentDocument.document
                            }
                        } catch (e) {
                            $.handleError(s, xml, null, e)
                        }
                        text = $('<div>'+xml.responseText+'</div>').text();
                        if (text || isTimeout == "timeout") {
                            requestDone = true;
                            var status;
                            try {
                                status = isTimeout != "timeout" ? "success" : "error";
                                if (status != "error") {
                                    var data = $.uploadHttpData(text, s.dataType);
                                    if (s.success) s.success(text, formId, s.srcElement);
                                    if (s.global) $.event.trigger("ajaxSuccess", [text, s])
                                } else $.handleError(s, text, status)
                            } catch (e) {
                                $.handleError(s, text, status, e)
                            }
                            if (s.global) $.event.trigger("ajaxComplete", [text, s]);
                            if (s.global && !--$.active) $.event.trigger("ajaxStop");
                            if (s.complete) s.complete(text, status);
                            $(io).unbind();
                            setTimeout(function() {
                                try {
                                    $(io).remove();
                                    $(form).remove()
                                } catch (e) {
                                    $.handleError(s, text, null, e)
                                }
                            }, 100);
                            text = null;
                        }
                    }
                if (s.timeout > 0) {
                    setTimeout(function() {
                        if (!requestDone) uploadCallback("timeout")
                    }, s.timeout)
                }
            }
            try {
                if ("undefined" !== typeof e && "undefined" !== typeof e.target && "undefined" !== typeof e.target.files) {
                    for(i = 0; i < e.target.files.length; i++){
                        nonce = parseInt(Math.random()*99999999);
                        s.beforeUpload(e.target.files[i], nonce, s.srcElement);
                        if(e.target.files[i].size > s.maxSize || e.target.files[i].size < s.minSize){
                            s.error(e.target.files[i], nonce, 'Filesize Limit exceeded!', s.srcElement);
                            continue;
                        }
                        var data = new FormData();
                        for(j in s.data){
                            data.append(j, s.data[j]);
                        }
                        data.append("file", e.target.files[i]);
                        xmlHTTP = new XMLHttpRequest();
                        xmlHTTP.nonce = nonce;
                        xmlHTTP.file = e.target.files[i];
                        xmlHTTP.open("POST", s.url);
                        xmlHTTP.onreadystatechange = function(a) {
                            if(a.target.readyState!=4)return false;
                            try{
                                eval('var json='+a.target.responseText);
                            }catch(e){
                                s.error(a.target.file, a.target.nonce, 'Server Error!', s.srcElement);
                                return false;
                            }
                            if ("undefined" !== typeof s.success) {s.success(json, a.target.nonce, s.srcElement);}
                            delete(json);
                        };
                        xmlHTTP.send(data);
                        delete(data);
                    }
                } else {
                    s.beforeUpload({name: ex.split('\\').reverse()[0]}, formId, s.srcElement);
                    var form = $('#' + formId);
                    $(form).find('input[type="file"]').attr('name', s.filedName);
                    $(form).attr('action', s.url);
                    $(form).attr('method', 'POST');
                    $(form).attr('target', frameId);
                    if (form.encoding) {
                        $(form).attr('encoding', 'multipart/form-data')
                    } else {
                        $(form).attr('enctype', 'multipart/form-data')
                    }
                    $(form).submit()
                }
            } catch (e) {
                $.handleError(s, xml, null, e)
            }
            $('#' + frameId).load(uploadCallback);
            return {
                abort: function() {}
            }
        },
        uploadHttpData: function(r, type) {
            var data = !type;
            data = type == "xml" || data ? r.responseXML : r.responseText;
            if (type == "script") $.globalEval(data);
            if (type == "json") eval("data = " + data);
            if (type == "html") $("<div>").html(data).evalScripts();
            return data
        }
    });
    $.fn.extend({
        uploader: function(o) {
            _o = {
                url: null,
                secureuri: null,
                data: null,
                fileElementId: null,
                filedName: null,
                dataType: 'json',
                minSize: 1,
                maxSize: 2*1024*1024,
                success: function(data, nonce){},
                beforeUpload: function(e, nonce){},
                allowExt: {
                    jpg: 1,
                    png: 1,
                    gif: 1,
                    jpeg: 1,
                    bmp: 1,
                    ico: 1,
                    webp: 1
                },
                paste: true
            };
            $.extend(_o, o);
            that = this;
            $(document).ready(function() {
                $(that).on('change', function(e) {
                    try{
                        that_ext = $(that).val().split('.').reverse()[0];
                        if ('undefined' === typeof _o.allowExt[that_ext] || _o.allowExt[that_ext] != 1) {
                            alert('此类文件不允许上传');
                            return false;
                        }
                    }catch(e){
                        alert('此类文件不允许上传');
                        return false;
                    }
                    $.ajaxFileUpload({
                        url: _o.url,
                        secureuri: _o.secureuri,
                        data: _o.data,
                        fileElementId: _o.fileElementId,
                        filedName: _o.filedName,
                        dataType: _o.dataType,
                        minSize: _o.minSize,
                        maxSize: _o.maxSize,
                        allowExt: _o.allowExt,
                        srcElement: $(e.target),
                        success: function(data, nonce, element) {
                            if ('string' === typeof data) {data = $.parseJSON(data);};
                            if ("undefined" !== typeof _o.success) return _o.success(data, nonce, element);
                        },
                        beforeUpload: function(e, nonce, element) {
                            if ("undefined" !== typeof _o.beforeUpload) return _o.beforeUpload(e, nonce, element);
                        },
                        error: function(data, nonce, msg, element) {
                            if ("undefined" !== typeof _o.error) return _o.error(e, nonce, msg, element);
                        }
                    }, e, $("undefined"!==typeof e.target?e.target:e.srcElement).val());
                });
            });
            if(_o.paste)$(document).on('paste', function(event){
                var items = (event.clipboardData || event.originalEvent.clipboardData).items;
                if(items.length<1)return false;
                blob = items[0].getAsFile();
                if("undefined"===typeof blob||null === blob||!blob)return false; // 粘帖的没有文件
                type = blob.type.replace('image/','');
                if(type === 'jpeg')type = 'jpg'
                blob.name = 'image.'+type;

                nonce = parseInt(Math.random()*99999999);
                _o.beforeUpload(blob, nonce);
                if(blob.size > _o.maxSize || blob.size < _o.minSize){
                    _o.error(blob, nonce, 'Filesize Limit exceeded!', $(this));
                }
                var data = new FormData();
                for(j in _o.data){
                    data.append(j, _o.data[j]);
                }
                data.append("file", blob, blob.name);
                xmlHTTP = new XMLHttpRequest();
                xmlHTTP.nonce = nonce;
                xmlHTTP.file = blob;
                xmlHTTP.open("POST", _o.url);
                xmlHTTP.onreadystatechange = function(a) {
                    if(a.target.readyState!=4)return false;
                    try{
                        eval('var json='+a.target.responseText);
                    }catch(e){
                        _o.error(a.target.file, a.target.nonce, 'Server Error!');
                        return false;
                    }
                    if ("undefined" !== typeof _o.success) {_o.success(json, a.target.nonce);}
                    delete(json);
                };
                xmlHTTP.send(data);
                delete(data);
                delete(items);
                delete(blob);
                delete(nonce);
                delete(type);
            });

        }
    });
})(window, jQuery);
