/**
 * @depends {nrs.js}
 * 
 */
var NRS = (function(NRS, $, undefined) {

	NRS.pages.p_cryptovalue = function() {
		var rows = "";
		var totalValue = 0;
		var accountBalanceValue = 0;
		var totalValueBase = 0;
		var basePair = 0;
		
		jQuery.ajaxSetup({async:false});
		$.get("http://api.cryptocoincharts.info/listCoins", function( data ) {

			$('#coininfo').hide();
			$('#coininfo').html(JSON.stringify(data));
		});
		jQuery.ajaxSetup({async:true});
		
		update("usd");
		
		jQuery.ajaxSetup({async:false});
		NRS.sendRequest("getAccountAssets", {"account":NRS.accountRS}, function(response) {
			if (response != undefined) {
				if(response.accountAssets.length>0){
					$.each(response.accountAssets, function(fieldName, value) {
						
					quantity = (value.quantityQNT/(Math.pow(10,value.decimals)));
					
					rows += "<tr>";

					rows += "<td>" + String(value.name).escapeHTML(); + "</td>";
					rows += "<td>" + String(value.asset).escapeHTML(); + "</td>";
					rows += "<td>" + NRS.format(parseInt(quantity)) + "</td>";
					
					jQuery.ajaxSetup({async:false});
					$.get("http://localhost:7876/nxt?requestType=getBidOrders&asset="+ value.asset, function(data) {

							data = JSON.parse(data);
							if (data.bidOrders && data.bidOrders.length) {
								totalValue+=(value.quantityQNT*data.bidOrders[0].priceNQT*Math.pow(10,-8));
								rows += "<td>" + NRS.format((value.quantityQNT*data.bidOrders[0].priceNQT*Math.pow(10,-8)).toFixed(0)) + "</td>";
								rows += "<td>" + NRS.format(((value.quantityQNT*data.bidOrders[0].priceNQT*Math.pow(10,-8))*basePair).toFixed(0)) + "</td>";
							}else{
								
								rows += "<td>/</td>";
								rows += "<td>/</td>";
							}
					});
					jQuery.ajaxSetup({async:true});
					
					
					
					
					rows += "</tr>"; 

					});
				}else{
					rows += "<tr>";
					rows += "<td>You don't have any assets yet</td>";
					rows += "</tr>";
					
				}
				
				
				
			}
			NRS.dataLoaded(rows);
			updateTotal();
		});
		jQuery.ajaxSetup({async:true});
		

		
		update("usd");
		updateAccountBalance("usd");
		updateTotal();
		updateAccountPlusAssets();


		function update(base){
			
			jQuery.ajaxSetup({async:false});
			$.get("http://api.cryptocoincharts.info/tradingPair/btc_"+base, function( data ) {
				var coininfo = JSON.parse($('#coininfo').html());
				$.each(coininfo, function(fieldName, value) {
						if(value.id=='nxt'){
							basePair=(data.price*value.price_btc).toFixed(4);
							$('#base').html((data.price*value.price_btc).toFixed(4));
						}
				});
			});
			jQuery.ajaxSetup({async:true});
			$('#totalValueBaseLabel').html(base.toUpperCase());
			$('#baseLabel').html(base.toUpperCase());
			
		};
		
		//Custom Input
		//function updateInput(base){
			
			//jQuery.ajaxSetup({async:false});
			//$.get("http://api.cryptocoincharts.info/tradingPair/"+base+"_btc", function( data ) {
				//var coininfo = JSON.parse($('#coininfo').html());

				//$('#base').html((parseFloat(data.price)).toFixed(5));
			//});
			//jQuery.ajaxSetup({async:true});
			//$('#totalValueBaseLabel').html(base.toUpperCase());
			//$('#baseLabel').html(base.toUpperCase());
			
		//};
		
		function updateBTCBase(){
			
			var coininfo = JSON.parse($('#coininfo').html());
			
			$.each(coininfo, function(fieldName, value) {
					if(value.id=='nxt'){
						$('#base').html((parseFloat(value.price_btc)).toFixed(8));
					}
			});
			$('#baseLabel').html("BTC");
			$('#totalValueBaseLabel').html("BTC");
		};
		
		function updateAccountBalance(base){
			
			
			jQuery.ajaxSetup({async:false});
			$.get("http://localhost:7876/nxt?requestType=getAccount&account="+NRS.accountRS, function( data ) {
				$('#baseLabelAccount').html(base.toUpperCase());
				
				var output = NRS.format((JSON.parse(data).unconfirmedBalanceNQT*Math.pow(10,-8)).toFixed(0));
				$('#accountBalance').html(output);
				var balanceValue = (JSON.parse(data).unconfirmedBalanceNQT*Math.pow(10,-8)*$('#base').html()).toFixed(2);
				if(balanceValue>=1000){
					$('#accountBalanceValue').html(NRS.format(parseInt(balanceValue)));
				}else{
					
					$('#accountBalanceValue').html(balanceValue);
				};
				accountBalanceValue=balanceValue;
				
			});
			jQuery.ajaxSetup({async:true});

		};
		
		function updateTotal(){
			

			totalValueBase = totalValue*$('#base').html();
			var output = NRS.format(totalValue.toFixed(0));

			
			$('#totalValue').html(output);
			if(totalValueBase>=1000){
				$('#totalValueBase').html(NRS.format(parseInt(totalValueBase)));
			}else{
				$('#totalValueBase').html(totalValueBase.toFixed(2));
			};
		};
		
		function updateAccountPlusAssets(){
			
			total = parseFloat(accountBalanceValue)+parseFloat(totalValueBase);
			if(total>=1000){
				$('#accountPlusAssets').html(NRS.format(parseInt(total)));
			}else{
				$('#accountPlusAssets').html(total.toFixed(2));
			};
			$('#accountPlusAssetsLabel').html($('#baseLabel').html());
		};
		
		
		
		$('.btn-base').on('click', function () {
			if(this.value=="btc"){
				updateBTCBase();
			}else if(this.value=="input"){
				updateInput(document.getElementById('baseinput').value);
			}else{
				update(this.value);
			}
			updateAccountBalance(this.value);
			updateTotal();
			updateAccountPlusAssets();
		})
		
		

		
		
	}

	NRS.setup.p_cryptovalue = function() {
		//Do one-time initialization stuff here
		//$('#p_cryptovalue_startup_date_time').html(moment().format('LLL'));

	}

	return NRS;
}(NRS || {}, jQuery));

//File name for debugging (Chrome/Firefox)
//@ sourceURL=nrs.hello_world.js
