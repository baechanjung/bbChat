var layerPop = (function() {
    /*
     var opt={
				width 	: option.width   || 300
			,	height 	: option.height  || 300
			,   href    : option.href    || ""
			,   header  : option.header  || ""
			,   bgcolor : option.bgcolor || ""
			,   btn     : option.btn     || []
			,   frm     : option.frm     || ""
			,   target  : option.target
			,   loading : option.loading
	 };
    */
    var options        = [];
    var arriframe      = [];
    var arrlayerTemp   = [];
    
    var layer = {
    		
        	getTarget : function(){
        		return options.target;
        	},
         	getLayer : function(){
        		return layerTemp;
        	},
    		open: function(opt) {
            	var lhtml      = "";
            	var iframeName = "";
            	var iframeView = ( opt.loading == "Y" ? "display:none;" : "" );  
            	
            	
            	layerIdx   = arrlayerTemp.length; 
            	iframeName = 'commonLayer' + (+new Date());
            	
            	options.push(opt);
            	
            	arriframe.push(iframeName);
            	
            	lhtml += "	<form id='layerfrm' name='layerfrm'  ></form>																			";
            	lhtml += "		<div id='layer"+layerIdx+"' class='bblayer' style='display:none;'>													";
            	lhtml += "		<div class='bg'></div>																								";
            	lhtml += "		<div class='bbpop-layer' >																		";
            	lhtml += "			<div class='pop-container'>																						";
            	lhtml += "				<div class='pop-conts'>																						";
            	if(opt.header != ""){
            	lhtml += "				<div class='header-layer'><h3>"+opt.header+"</h3><a style='cursor:pointer;' class='btn_popclose' onclick='closeLayer();'><img src='/bbChat/img/btn/btn_pop_close.png'></a></div>																	";
            	}
           
            	if(opt.frm !=""){
            	lhtml += "					<iframe id='"+iframeName+"' name='"+iframeName+"' style='"+iframeView+"' frameBorder=0 style='overflow:hidden;' ></iframe>	";
            	}
            	
            	if(opt.btn.length > 0 ){
            	lhtml += "					<div class='footer-layer'>																					";
            	$.each(opt.btn,function(i,v){
            		if( v.btnFn == "" || v.btnFn == null || v.btnFn == undefined ){
            			lhtml += "						<a style='cursor:pointer;' class='"+ (v.btnCss || "cbtn-d") +"' onclick='closeLayer();' >"+v.btnNm+"</a>																	";
            		}else{
            			lhtml += "						<a style='cursor:pointer;' class='"+ (v.btnCss || "cbtn-d") +"' onclick=\"layerPop.exLayerBtn('"+v.btnFn+"');\" >"+v.btnNm+"</a>																	";
            		}
            	});
            	lhtml += "					</div>																									";
            	}
            	lhtml += "				</div>																										";
            	lhtml += "			</div>																											";
            	lhtml += "		</div>																												";
            	lhtml += "		</div>																												";

            	
            	$(window.parent.document).find("body").append(lhtml);
            	
        		var temp = $(window.parent.document).find("body").find("#layer"+layerIdx).find(".bbpop-layer");
        		
        		if( opt.bgcolor != "" ){
        			$(temp).css("background-color" , opt.bgcolor  );
        		}
        		
        		
        		$(temp).width (opt.width  );
        		$(temp).height(opt.height );
        		
        		$(temp).find("#"+iframeName).width (opt.width      );
        		
        		if(opt.btn.length > 0 ){
        			$(temp).find("#"+iframeName).height(opt.height - 87); //헤더와 푸터 높이
        		}else{
        			$(temp).find("#"+iframeName).height(opt.height - 42); //헤더
        		}

        		layer.centerPosition(temp);
        		
        		
        		$(temp).parent().show();
        		//$(temp).fadeIn("fast");
        		
        		if( opt.loading == "Y" ){
	    			var $load = $(document.createElement("div"));
	    			$load.attr  ("id"     , "layerLoading"   );
	    			$load.attr  ("name"   , "layerLoading"   );
	    			$load.attr  ("class"  , "bbpop-load"	 );
	    			$load.width (opt.width  + 10		); 
					$load.height(opt.height + 10     );
	    			$(temp).parent().append($load);
	    			layer.centerPosition($load);
//        			dc.setNowLoding({"_LODING_BAR_YN_":"Y"});
        		}
        		
        		if(opt.frm !=""){
        			
	        		$form = opt.frm.clone();
	        		if( (opt.href).indexOf("?") > -1){
	        			var param = (opt.href).substring((opt.href).indexOf("?")+1, (opt.href).length ).split("&");
						$.each(param , function(i,v){
				    		var $element = $(document.createElement("input"));
				    		$element.attr ("type" ,"hidden");
				    		$element.attr ("id"   ,v.split("=")[0]       );
				    		$element.attr ("name" ,v.split("=")[0]       );
				    		$element.val  (v.split("=")[1]               );
							$form.append($element);
						});
					}
	        		$(window.parent.document).find("#layerfrm").html($form.html());
	        		$(window.parent.document).find("#layerfrm").attr("method" ,"post"      );
	        		$(window.parent.document).find("#layerfrm").attr("target" , iframeName);
	        		$(window.parent.document).find("#layerfrm").attr("action" , opt.href  );
	        		$(window.parent.document).find("#layerfrm").submit();
	        		$(window.parent.document).find("#layerfrm").remove();
	        		
        		}else{
        			$(temp).fadeIn("slow",function(){
//        				$(window.parent.document).find("#layerLoading").remove();
        				dc.removeLoding();
        			});
        		}
        	
        		arrlayerTemp.push($(temp).parent());
        		
            },
            
            close : function( callbackFn , data ){
            	var targetDocument = options[options.length-1].target;
        		var temp = arrlayerTemp[arrlayerTemp.length-1];
        		
        		/*
        		$(temp).fadeOut("slow",function(){
        			$(temp).remove();
        		});
        		*/
        		$(temp).remove();
        		
        		options.pop();
        		arriframe.pop();
        		arrlayerTemp.pop();
        		
        		if( targetDocument != undefined || targetDocument != null){
        			if(callbackFn != undefined || callbackFn != null){
        				var callFn = targetDocument[callbackFn];
        				if($.isFunction(callFn)){
        					callFn(data);
        				}
        			}
        		}
        		
            },
            
            closeLoading : function (){
            	$(window.parent.document).find("#layerLoading").remove();
            	//dc.removeLoding();
            },
		  
		  	centerPosition : function(temp){
				// 화면의 중앙에 레이어를 띄운다.
        		
        		if (temp.outerHeight() < $(window.parent).height()){
        			temp.css('margin-top', '-' + temp.outerHeight() / 2 + 'px');
        			temp.css('top', '');
        		}
        		else
        			temp.css('top', '15px');
        		
        		
        		if (temp.outerWidth() < $(window.parent).width()){
        			temp.css('margin-left', '-' + temp.outerWidth() / 2 + 'px');
        			temp.css('left', '');
        		}
        		else
        			temp.css('left', '15px');
		  	},
		  	
		  	exLayerBtn : function(fnNm){
				var iframe = document.getElementById(arriframe[arriframe.length-1]);
				var objDoc = iframe.contentWindow || iframe.contentDocument;
				var callFn = objDoc[fnNm];
				if($.isFunction(callFn)){
					callFn();
				}
		  	},
      		
    		resize : function (options) {

    			var temp = $(arrlayerTemp[arrlayerTemp.length-1]).find(".bbpop-layer");
    			var w,h,wp,hp;
    			
    			if( $(temp).width() > options.width ){
    				w  = $(temp).width() - options.width;
    				wp = "-";
    			}else{
    				w  = options.width - $(temp).width();
    				wp = "+";
    			}
    			
    			if( $(temp).height() > options.height ){
    				h  = $(temp).height() - options.height;
    				hp = "-";
    			}else{
    				h  = options.height - $(temp).height();
    				hp = "+";
    			}
    			
        		$(temp).find("iframe").width (options.width);
        		$(temp).find("iframe").height(options.height - 90);

  
        		$(temp).animate({
	        		         width : wp + "=" + w + "px"
	        		       , height: hp + "=" + h + "px"
	        		       , layercenterPosition : ""
	        		    }
		        		,
		        		{
		        		  duration: 500,
		        		  step: function(now, fx) {
		        			  layer.centerPosition(temp);
		        		  }
		        		}
        		);
        		
		    },
		    
		    iframeLoad  : function(){
		    	$(arrlayerTemp[arrlayerTemp.length-1]).find(".bbpop-layer").find("iframe").fadeIn("slow");
		    	$(window.parent.document).find("#layerLoading").remove();
		    	//dc.removeLoding();
		    } 
    
    };
    
    return layer;
    
})();

function openLayer(opt){
	var doc;
	try{
		doc = window.parent;
		doc.layerPop.open(opt);
	}catch(e){
		layerPop.open(opt);
	}
}

function closeLayer( callbackFn , data ){
	var doc;
	try{
		doc = window.parent;
		doc.layerPop.close( callbackFn , data );
	}catch(e){
		layerPop.close( callbackFn , data );
	}
}

function resizeLayer(opt){
	var doc;
	try{
		doc = window.parent;
		doc.layerPop.resize( opt );
	}catch(e){
		layerPop.resize( opt );
	}
}

function openIframeLoad(){
	var doc;
	try{
		doc = window.parent;
		doc.layerPop.iframeLoad();
	}catch(e){
		layerPop.iframeLoad();
	}
}
