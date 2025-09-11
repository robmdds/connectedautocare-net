//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//
// HELCIM JAVASCRIPT FOR AJAX CLIENT-SIDE TRANSACTIONS
// VERSION 2.1.3
// LAST UPDATED 2017-06-14
// VISIT WWW.HELCIM.COM/SUPPORT/ FOR DOCUMENTATION
// COPYRIGHT (C) 2006-2017 HELCIM INC. ALL RIGHTS RESERVED.
//
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////


// SETTINGS
var helcimResultPaneName = 'helcimResults';
var url = 'https://secure.myhelcim.com/js/';
var language = 'en';
var formId = 'helcimForm';

// CHECK FOR PROMISES
if (typeof Promise == 'undefined') {

	var js_script = document.createElement('script');
	js_script.type = "text/javascript";
	js_script.src = url + "es6-promise-fix.js";
	js_script.async = false;
	document.getElementsByTagName('head')[0].appendChild(js_script);
}

//////////////////////////////////////////////////////////////////////////////////////
// FUNCTION - PROCESS TRANSACTION
//////////////////////////////////////////////////////////////////////////////////////
function helcimProcess(){

	// RETURN PROMISE
	return new Promise(function(resolve, reject) {

		// SET LANGUAGE
		helcimSetLanguage();

		// CHECK REQUIRED FIELDS
		if(helcimRequiredFields() == true){

			// CHECK FOR CORS SUPPORT
			if(helcimCheckBrowserSupport() == false){

				// NOT SUPPORTED
				document.getElementById(helcimResultPaneName).innerHTML = helcimTranslate('YOUR BROWSER IS NOT SUPPORTED');

			}else{

				// DISABLE BUTTON
				helcimToggleButton();

				// REQUIRED FIELDS
				var token = null;
				var test = false;
				var plugin = null;
				var pluginVersion = null;

				// OPTIONAL - CARD INFORMATION
				var cardNumber = null;
				var cardExpiry = null;
				var cardCVV = null;
				var cardToken = null;	// THIS IS ONLY USED TO UPDATE CARD INFORMATION

				// OPTIONAL - AVS
				var cardHolderName = null;
				var cardHolderAddress = null;
				var cardHolderPostalCode = null;

				// BANK ACCOUNT INFORMATION
				var bankAccountToken = null; // THIS IS ONLY USED TO UPDATE BANK ACCOUNT INFORMATION
				var bankAccountType = null;
				var bankAccountCorporate = null;
				var bankTransitNumber = null;
				var bankAccountNumber = null;
				var bankFirstName = null;
				var bankLastName = null;
				var bankCompanyName = null;
				var bankStreetAddress = null;
				var bankCity = null;
				var bankProvince = null;
				var bankCountry = null;
				var bankPostalCode = null;

				// OPTIONAL - ORDER
				var amount = '0.00';
				var currency = null;
				var currencyHash = null;
				var amountHash = null;
				var orderNumber = null;
				var customerCode = null;
				var amountShipping = null;
				var amountTax = null;
				var amountDiscount = null;
				var comments = null;

				// OPTIONAL - BILLING
				var billing_name = null;
				var billing_contactName = null;
				var billing_businessName = null;
				var billing_street1 = null;
				var billing_street2 = null;
				var billing_city = null;
				var billing_province = null;
				var billing_postalCode = null;
				var billing_country = null;
				var billing_phone = null;
				var billing_email = null;
				var billing_fax = null;

				// OPTIONAL - SHIPPING
				var shipping_name = null;
				var shipping_contactName = null;
				var shipping_businessName = null;
				var shipping_street1 = null;
				var shipping_street2 = null;
				var shipping_city = null;
				var shipping_province = null;
				var shipping_postalCode = null;
				var shipping_country = null;
				var shipping_phone = null;
				var shipping_email = null;
				var shipping_fax = null;

				// OPTIONAL - ITEMS
				var items = [];

				// OPTIONAL - CAPTCHA
				var captcha = null;

				// SET
				var dataPOST = '';

				// CHECK FOR TEST MODE
				if (document.getElementById('test') != null) {
					test = document.getElementById('test').value;
				}

				// GET VALUES - REQUIRED
				if (document.getElementById('token') != null) {
					token = document.getElementById('token').value;
				}
				if (document.getElementById('plugin') != null) {
					plugin = document.getElementById('plugin').value;
				}
				if (document.getElementById('pluginVersion') != null) {
					pluginVersion = document.getElementById('pluginVersion').value;
				}

				// GET VALUES - CARD INFORMATION
				if (document.getElementById('cardNumber') != null) {
					cardNumber = document.getElementById('cardNumber').value;
				}
				if (document.getElementById('cardCVV') != null) {
					cardCVV = document.getElementById('cardCVV').value;
				}
				if (document.getElementById('cardToken') != null) {
					cardToken = document.getElementById('cardToken').value;
				}
				if (document.getElementById('cardExpiry') != null) {
					cardExpiry = document.getElementById('cardExpiry').value;
				} else if (document.getElementById('cardExpiryYear') != null && document.getElementById('cardExpiryMonth') != null) {

					// GET MONTH AND YEAR FIELDS
					var month = document.getElementById('cardExpiryMonth').value;
					var year = document.getElementById('cardExpiryYear').value;

					// IF YEAR IS 4 CHARACTERS LONG REMOVE THE FIRST 2 CHARACTERS
					if(year.length == 4){ year = year.substring(2,4); }

					// APPEND MONTH AND YEAR TO EXPIRY DATE
					cardExpiry = month+year;

				}

				// GET VALUES - AVS
				if(document.getElementById('cardHolderName') != null){ cardHolderName = document.getElementById('cardHolderName').value; }
				if(document.getElementById('cardHolderAddress') != null){ cardHolderAddress = document.getElementById('cardHolderAddress').value; }
				if(document.getElementById('cardHolderPostalCode') != null){ cardHolderPostalCode = document.getElementById('cardHolderPostalCode').value; }

				// GET VALUES - BANK ACCOUNT
				if(document.getElementById('bankAccountToken') != null){ bankAccountToken = document.getElementById('bankAccountToken').value; }
				if(document.getElementById('bankAccountType') != null){ bankAccountType = document.getElementById('bankAccountType').value; }
				if(document.getElementById('bankAccountCorporate') != null){ bankAccountCorporate = document.getElementById('bankAccountCorporate').value; }
				if(document.getElementById('bankTransitNumber') != null){ bankTransitNumber = document.getElementById('bankTransitNumber').value; }
				if(document.getElementById('bankAccountNumber') != null){ bankAccountNumber = document.getElementById('bankAccountNumber').value; }
				if(document.getElementById('bankFirstName') != null){ bankFirstName = document.getElementById('bankFirstName').value; }
				if(document.getElementById('bankLastName') != null){ bankLastName = document.getElementById('bankLastName').value; }
				if(document.getElementById('bankCompanyName') != null){ bankCompanyName = document.getElementById('bankCompanyName').value; }
				if(document.getElementById('bankStreetAddress') != null){ bankStreetAddress = document.getElementById('bankStreetAddress').value; }
				if(document.getElementById('bankCity') != null){ bankCity = document.getElementById('bankCity').value; }
				if(document.getElementById('bankProvince') != null){ bankProvince = document.getElementById('bankProvince').value; }
				if (document.getElementById('bankCountry') != null) {
					bankCountry = document.getElementById('bankCountry').value;
				}
				if (document.getElementById('bankPostalCode') != null) {
					bankPostalCode = document.getElementById('bankPostalCode').value;
				}

				// GET VALUES - ORDER
				if (document.getElementById('amount') != null) {
					amount = document.getElementById('amount').value;
				}
				if (document.getElementById('currency') != null) {
					currency = document.getElementById('currency').value;
				}
				if (document.getElementById('currencyHash') != null) {
					currencyHash = document.getElementById('currencyHash').value;
				}
				if (document.getElementById('amountHash') != null) {
					amountHash = document.getElementById('amountHash').value;
				}
				if (document.getElementById('orderNumber') != null) {
					orderNumber = document.getElementById('orderNumber').value;
				}
				if (document.getElementById('customerCode') != null) {
					customerCode = document.getElementById('customerCode').value;
				}
				if (document.getElementById('amountShipping') != null) {
					amountShipping = document.getElementById('amountShipping').value;
				}
				if (document.getElementById('amountTax') != null) {
					amountTax = document.getElementById('amountTax').value;
				}
				if (document.getElementById('amountDiscount') != null) {
					amountDiscount = document.getElementById('amountDiscount').value;
				}
				if (document.getElementById('comments') != null) {
					comments = document.getElementById('comments').value;
				}

				// GET VALUES - BILLING
				if(document.getElementById('billing_contactName') != null){ billing_contactName = document.getElementById('billing_contactName').value; }
				if(document.getElementById('billing_businessName') != null){ billing_businessName = document.getElementById('billing_businessName').value; }
				if(document.getElementById('billing_street1') != null){ billing_street1 = document.getElementById('billing_street1').value; }
				if(document.getElementById('billing_street2') != null){ billing_street2 = document.getElementById('billing_street2').value; }
				if(document.getElementById('billing_city') != null){ billing_city = document.getElementById('billing_city').value; }
				if(document.getElementById('billing_province') != null){ billing_province = document.getElementById('billing_province').value; }
				if(document.getElementById('billing_postalCode') != null){ billing_postalCode = document.getElementById('billing_postalCode').value; }
				if(document.getElementById('billing_country') != null){ billing_country = document.getElementById('billing_country').value; }
				if(document.getElementById('billing_phone') != null){ billing_phone = document.getElementById('billing_phone').value; }
				if(document.getElementById('billing_email') != null){

					// CHECK VALID EMAIL
					if(helcimValidateEmail(document.getElementById('billing_email').value)){

						// SET
						billing_email = document.getElementById('billing_email').value;

					}

				}

				if(document.getElementById('billing_fax') != null){ billing_fax = document.getElementById('billing_fax').value; }

				// GET VALUES - SHIPPING
				if(document.getElementById('shipping_contactName') != null){ shipping_contactName = document.getElementById('shipping_contactName').value; }
				if(document.getElementById('shipping_businessName') != null){ shipping_businessName = document.getElementById('shipping_businessName').value; }
				if(document.getElementById('shipping_street1') != null){ shipping_street1 = document.getElementById('shipping_street1').value; }
				if(document.getElementById('shipping_street2') != null){ shipping_street2 = document.getElementById('shipping_street2').value; }
				if(document.getElementById('shipping_city') != null){ shipping_city = document.getElementById('shipping_city').value; }
				if(document.getElementById('shipping_province') != null){ shipping_province = document.getElementById('shipping_province').value; }
				if(document.getElementById('shipping_postalCode') != null){ shipping_postalCode = document.getElementById('shipping_postalCode').value; }
				if(document.getElementById('shipping_country') != null){ shipping_country = document.getElementById('shipping_country').value; }
				if(document.getElementById('shipping_phone') != null){ shipping_phone = document.getElementById('shipping_phone').value; }
				if(document.getElementById('shipping_email') != null){

					// CHECK VALID EMAIL
					if(helcimValidateEmail(document.getElementById('shipping_email').value)){

						// SET
						shipping_email = document.getElementById('shipping_email').value;

					}

				}

				if(document.getElementById('shipping_fax') != null){ shipping_fax = document.getElementById('shipping_fax').value; }

				//
				// GET VALUES - ITEMS
				//

				// LOOP THROUGH ALL ITEMS
				var count = 1;
				while(document.getElementById('itemSKU'+count) != null){

					// CREATE VARIABLES
					var sku = '';
					var description = '';
					var serialNumber = '';
					var quantity = '';
					var price = '';
					var total = '';

					// GET VALUES
					if(document.getElementById('itemSKU'+count) != null){ sku = document.getElementById('itemSKU'+count).value; }
					if(document.getElementById('itemDescription'+count) != null){ description = document.getElementById('itemDescription'+count).value; }
					if(document.getElementById('itemSerialNumber'+count) != null){ serialNumber = document.getElementById('itemSerialNumber'+count).value; }
					if(document.getElementById('itemQuantity'+count) != null){ quantity = document.getElementById('itemQuantity'+count).value; }
					if(document.getElementById('itemPrice'+count) != null){ price = document.getElementById('itemPrice'+count).value; }
					if(document.getElementById('itemTotal'+count) != null){ total = document.getElementById('itemTotal'+count).value; }

					// ADD VALUES TO ITEMS ARRAY
					items[count-1] = {itemSKU: sku, itemDescription: description, itemSerialNumber: serialNumber, itemQuantity: quantity, itemPrice: price, itemTotal: total};

					count++;

				}

				// GET VALUES - CAPTCHA
				if(document.getElementById('g-recaptcha-response') != null){ captcha = document.getElementById('g-recaptcha-response').value; }

				// SET ERROR DEFAULT
				var errors = '';

				// CHECK FIELDS
				if(!token){

					// ERROR
					errors = errors+"("+helcimTranslate('INVALID HELCIM.JS TOKEN')+") ";

				}

				// CHECK FOR EFT/ACH
				if(bankAccountType){

					//
					// EFT
					//

					// CHECK FIELDS
					if(!customerCode){

						// ERROR
						errors = errors+"("+helcimTranslate('INVALID CUSTOMER CODE')+") ";

					}

				}else{

					//
					// CARD TRANSACTION
					//

					// CHECK FIELDS
					if(helcimValidateCardNumber(cardNumber) == false){ errors = errors+"("+helcimTranslate('INVALID CREDIT CARD NUMBER')+") "; }
					if(helcimValidateCardExpiry(cardExpiry) == false){ errors = errors+"("+helcimTranslate('INVALID CREDIT CARD EXPIRY')+") "; }
					if(helcimValidateCardCVV(cardCVV) == false){ errors = errors+"("+helcimTranslate('INVALID CREDIT CARD CVV')+") "; }

					//TODO: AVS CHECKING

				}

				// CHECK FOR ERRORS
				if(errors == ''){

					// SHOW ERROR
					document.getElementById(helcimResultPaneName).innerHTML = helcimTranslate('CONNECTING') + '...'; // DO NOT CHANGE BEING CHECKED IN WOOCOMMERCE

					// CREATE XML REQUEST
					var req = new XMLHttpRequest();

					// SET POST DATA
					var dataPOST = '';

					// ADD
					if (token != null) {
						dataPOST += 'token=' + token;
					}
					if (plugin != null) {
						dataPOST += '&plugin=' + plugin;
					}
					if (pluginVersion != null) {
						dataPOST += '&pluginVersion=' + pluginVersion;
					}
					if (test != null) {
						dataPOST += '&test=' + test;
					}
					if (document.getElementById('woocommerce') != null && document.getElementById('woocommerce').value == 1) {
						dataPOST += '&thirdParty=woocommerce';
					}
					if (cardNumber != null) {
						dataPOST += '&cardNumber=' + cardNumber;
					}
					if (cardExpiry != null) {
						dataPOST += '&cardExpiry=' + cardExpiry;
					}
					if (cardCVV != null) {
						dataPOST += '&cardCVV=' + cardCVV;
					}
					if (cardToken != null) {
						dataPOST += '&cardToken=' + cardToken;
					}
					if (cardHolderName != null) {
						dataPOST += '&cardHolderName=' + cardHolderName;
					}
					if (cardHolderAddress != null) {
						dataPOST += '&cardHolderAddress=' + cardHolderAddress;
					}
					if (cardHolderPostalCode != null) {
						dataPOST += '&cardHolderPostalCode=' + cardHolderPostalCode;
					}
					if (amount != null) {
						dataPOST += '&amount=' + amount;
					}
					if (currency != null) {
						dataPOST += '&currency=' + currency;
					}
					if (currencyHash != null) {
						dataPOST += '&currencyHash=' + currencyHash;
					}
					if (amountHash != null) {
						dataPOST += '&amountHash=' + amountHash;
					}
					if (orderNumber != null) {
						dataPOST += '&orderNumber=' + orderNumber;
					}
					if (customerCode != null) {
						dataPOST += '&customerCode=' + customerCode;
					}
					if (amountShipping != null) {
						dataPOST += '&amountShipping=' + amountShipping;
					}
					if (amountTax != null) {
						dataPOST += '&amountTax=' + amountTax;
					}
					if (amountDiscount != null) {
						dataPOST += '&amountDiscount=' + amountDiscount;
					}
					if (comments != null) {
						dataPOST += '&comments=' + comments;
					}
					if (bankAccountToken != null) {
						dataPOST += '&bankAccountToken=' + bankAccountToken;
					}
					if(bankAccountType != null){ dataPOST += '&bankAccountType='+bankAccountType; }
					if(bankAccountCorporate != null){ dataPOST += '&bankAccountCorporate='+bankAccountCorporate; }
					if(bankTransitNumber != null){ dataPOST += '&bankTransitNumber='+bankTransitNumber; }
					if(bankAccountNumber != null){ dataPOST += '&bankAccountNumber='+bankAccountNumber; }
					if(bankFirstName != null){ dataPOST += '&bankFirstName='+bankFirstName; }
					if(bankLastName != null){ dataPOST += '&bankLastName='+bankLastName; }
					if(bankCompanyName != null){ dataPOST += '&bankCompanyName='+bankCompanyName; }
					if(bankStreetAddress != null){ dataPOST += '&bankStreetAddress='+bankStreetAddress; }
					if(bankCity != null){ dataPOST += '&bankCity='+bankCity; }
					if(bankProvince != null){ dataPOST += '&bankProvince='+bankProvince; }
					if(bankCountry != null){ dataPOST += '&bankCountry='+bankCountry; }
					if(bankPostalCode != null){ dataPOST += '&bankPostalCode='+bankPostalCode; }
					if(billing_contactName != null){ dataPOST += '&billing_contactName='+billing_contactName; }
					if(billing_businessName != null){ dataPOST += '&billing_businessName='+billing_businessName; }
					if(billing_street1 != null){ dataPOST += '&billing_street1='+billing_street1; }
					if(billing_street2 != null){ dataPOST += '&billing_street2='+billing_street2; }
					if(billing_city != null){ dataPOST += '&billing_city='+billing_city; }
					if(billing_province != null){ dataPOST += '&billing_province='+billing_province; }
					if(billing_postalCode != null){ dataPOST += '&billing_postalCode='+billing_postalCode; }
					if(billing_country != null){ dataPOST += '&billing_country='+billing_country; }
					if(billing_phone != null){ dataPOST += '&billing_phone='+billing_phone; }
					if(billing_email != null){ dataPOST += '&billing_email='+billing_email; }
					if(billing_fax != null){ dataPOST += '&billing_fax='+billing_fax; }
					if(shipping_contactName != null){ dataPOST += '&shipping_contactName='+shipping_contactName; }
					if(shipping_businessName != null){ dataPOST += '&shipping_businessName='+shipping_businessName; }
					if(shipping_street1 != null){ dataPOST += '&shipping_street1='+shipping_street1; }
					if(shipping_street2 != null){ dataPOST += '&shipping_street2='+shipping_street2; }
					if(shipping_city != null){ dataPOST += '&shipping_city='+shipping_city; }
					if(shipping_province != null){ dataPOST += '&shipping_province='+shipping_province; }
					if(shipping_postalCode != null){ dataPOST += '&shipping_postalCode='+shipping_postalCode; }
					if(shipping_country != null){ dataPOST += '&shipping_country='+shipping_country; }
					if(shipping_phone != null){ dataPOST += '&shipping_phone='+shipping_phone; }
					if(shipping_email != null){ dataPOST += '&shipping_email='+shipping_email; }
					if(shipping_fax != null){ dataPOST += '&shipping_fax='+shipping_fax; }
					if(captcha != null){ dataPOST += '&g-recaptcha-response='+captcha; }

					// LOOP THROUGH ITEMS
					for(var index = 0, len = items.length; index < len; index++){

						// ADD ITEMS TO POST STRING
						dataPOST += '&itemSKU'+(index+1)+'='+items[index]['itemSKU'];
						dataPOST += '&itemDescription'+(index+1)+'='+items[index]['itemDescription'];
						dataPOST += '&itemSerialNumber'+(index+1)+'='+items[index]['itemSerialNumber'];
						dataPOST += '&itemQuantity'+(index+1)+'='+items[index]['itemQuantity'];
						dataPOST += '&itemPrice'+(index+1)+'='+items[index]['itemPrice'];
						dataPOST += '&itemTotal'+(index+1)+'='+items[index]['itemTotal'];

					}

					// CREATE XML REQUEST
					var newRequest = new XMLHttpRequest();

					// OPEN REQUEST
					newRequest.open('POST',url,true);

					// SEND INFO WITH REQUEST
					newRequest.setRequestHeader("Content-type","application/x-www-form-urlencoded");

					// THESE FIELDS GIVE JAVASCRIPT ERRORS
					// newRequest.setRequestHeader("Content-length",dataPOST.length);
					// newRequest.setRequestHeader("Connection","close");

					// CHANGE STATE
					newRequest.onreadystatechange = function(){

						// CHECK READY STATE
						if(this.readyState == 4){

							// CHECK GOOD STATUS
							if(this.status == 200){

								// GET XML
								var responseXML = newRequest.responseXML;

								// CLEAN SENSITIVE DATA
								helcimCleanCardData();

								// TRANSACTION COMPLETED
								document.getElementById(helcimResultPaneName).innerHTML = helcimParseXMLtoFields(responseXML);

								// CHECK
								if(typeof(document['helcimForm']) !== 'undefined'){

									// SUBMIT FORM
									document['helcimForm'].submit();

								}

								// RESOLVE PROMISE
								resolve(document.getElementById(helcimResultPaneName).innerHTML);

							}else{

								// ENABLE BUTTON
								helcimToggleButton();

								// SHOW ERROR
								document.getElementById(helcimResultPaneName).innerHTML = helcimTranslate('ERROR')+'(STATUS:'+this.status+'): '+helcimTranslate('COMMUNICATION ERROR');

								// REJECT PROMISE
								reject(document.getElementById(helcimResultPaneName).innerHTML);

							}

						}else{

							// ENABLE BUTTON
							//helcimToggleButton();

							// HIDE ERROR SINCE STATE 4 CAN TAKE A WHILE TO LOAD
							//document.getElementById(helcimResultPaneName).innerHTML = 'ERROR: JS ERROR '+newRequest.readyState;

						}

					}

					// SEND NULL
					newRequest.send(dataPOST);

				}else{

					// ENABLE BUTTON
					helcimToggleButton();

					// SHOW ERROR
					document.getElementById(helcimResultPaneName).innerHTML = helcimTranslate('ERROR')+': '+errors;
					reject(helcimTranslate('ERROR')+': '+errors);

				}

			}

		}

	});

} // END FUNCTION

//////////////////////////////////////////////////////////////////////////////////////
// FUNCTION - VALIDATE EMAIL
//////////////////////////////////////////////////////////////////////////////////////
function helcimValidateEmail(email) {

	// REGEX
	var re = /\S+@\S+\.\S+/;

	// RETURN RESULT
	return re.test(email);

} // END FUNCTION

//////////////////////////////////////////////////////////////////////////////////////
// FUNCTION - VALIDATE CREDIT CARD NUMBER (original code by DiegoSalazar)
//////////////////////////////////////////////////////////////////////////////////////
function helcimValidateCardNumber(value){

	// ACCEPT ONLY DIGITS, DASHES OR SPACES
	if(/[^0-9-\s]+/.test(value)){

		return false;

	}

	// REMOVE SPACES AND DASHES
	value = value.replace(/\D/g,"");

	// CHECK CARD LEN (AMEX MUST START WITH 3)
	if(!((value.length == 15 && value.charAt(0) == 3) || value.length == 16 || (value.length == 14 && value.charAt(0) == 3))){

		return false;

	}

	// LUHN ALGORITHM
	var nCheck = 0;
	var nDigit = 0;
	var bEven = false;

	// LOOP
	for(var n = value.length - 1; n >= 0; n--){

		// SET VALUES
		var cDigit = value.charAt(n);
		var nDigit = parseInt(cDigit, 10);

		// CHECK FOR EVEN
		if(bEven){

			// CHECK FOR SOMETHING
			if((nDigit *= 2) > 9){

				// SUBSRACT 9
				nDigit -= 9;

			}

		}

		// INCREASE
		nCheck += nDigit;
		bEven = !bEven;

	}

	// RETURN
	return (nCheck % 10) == 0;

} // END FUNCTION

//////////////////////////////////////////////////////////////////////////////////////
// FUNCTION - VALIDATE CREDIT CARD EXPIRY
//////////////////////////////////////////////////////////////////////////////////////
function helcimValidateCardExpiry(value){

	// CHECK LENGTH
	if(value.length == 4){

		// CHECK DIGITS
		if(value.match(/^[0-9]+$/) != null){

			return true;

		}else{

			return false;

		}

	}else{

		return false;

	}

} // END FUNCTION

//////////////////////////////////////////////////////////////////////////////////////
// FUNCTION - VALIDATE CREDIT CARD CVV
//////////////////////////////////////////////////////////////////////////////////////
function helcimValidateCardCVV(value){

	// CHECK LENGTH
	if(value.length == 3 || value.length == 4){

		// CHECK DIGITS
		if(value.match(/^[0-9]+$/) != null){

			return true;

		}else{

			return false;

		}

	}else{

		return false;

	}

} // END FUNCTION

//////////////////////////////////////////////////////////////////////////////////////
// FUNCTION - ENABLE AND DISABLE PROCESS BUTTON
//////////////////////////////////////////////////////////////////////////////////////
function helcimToggleButton(){

	// CHECK
	if(document.getElementById('buttonProcess') == null){ return; }

	// CHECK FOR CURRENT STATUS
	if(document.getElementById('buttonProcess').disabled == true){

		// ENABLE
		document.getElementById('buttonProcess').value = helcimTranslate('Process Payment');
		document.getElementById('buttonProcess').disabled = false;

	}else{

		// DISABLE
		document.getElementById('buttonProcess').value = helcimTranslate('Processing, Please Wait')+'...';
		document.getElementById('buttonProcess').disabled = true;

	}

} // END FUNCTION

//////////////////////////////////////////////////////////////////////////////////////
// FUNCTION - CHECK REQUIRED FIELDS
//////////////////////////////////////////////////////////////////////////////////////
function helcimRequiredFields(){

	// SET ERROR DEFAULT
	var errors = '';

	// CHECK FIELDS
	if(document.getElementById(helcimResultPaneName) == null){ errors = errors+'('+helcimResultPaneName+')'; }
	if(document.getElementById('token') == null){ errors = errors+'(token)'; }
	if(document.getElementById('helcimForm') == null){

		// CHECK FOR SUBMITTION
		if((document.getElementById('woocommerce') != null && document.getElementById('woocommerce').value == 1)
			|| (document.getElementById('dontSubmit') != null && document.getElementById('dontSubmit').value == 1)){

			// ALL GOOD, WOO COMMERCE FORM NAME IS checkout

		}else{

			// ERROR
			errors = errors+'(helcimForm)';

		}

	}

	// CHECK FOR ERRORS
	if(errors == ''){

		return true;

	}else{

		// ALERT
		window.alert('HELCIM REQUIRED FIELDS MISSING: '+errors);

		return false

	}

} // END FUNCTION

//////////////////////////////////////////////////////////////////////////////////////
// FUNCTION - CHECK PARSE XML TO FIELDS
//////////////////////////////////////////////////////////////////////////////////////
function helcimParseXMLtoFields(xmlObject){

	// SET DEFAULT
	var html = '';
	var loopCount;
	var fieldNames;
	var tempKey;
	var tempValue;

	// DESIRED FIELDS
	fieldNames = [
		'response',
		'responseMessage',
		'noticeMessage',
		'date',
		'time',
		'type',
		'amount',
		'cardHolderName',
		'cardNumber',
		'cardExpiry',
		'cardToken',
		'cardType',
		'transactionId',
		'avsResponse',
		'cvvResponse',
		'approvalCode',
		'orderNumber',
		'customerCode',
		'currency',
		'bankAccountType',
		'bankAccountCorporate',
		'bankAccountToken',
		'bankFinancialNumber',
		'bankTransitNumber',
		'bankAccountNumber',
		'xmlHash',
		];

	// LOOP THROUGH ARRAY
	for(loopCount = 0; loopCount < fieldNames.length; ++loopCount){

		// GET ARRAY KEY AND VALUE
		tempKey = fieldNames[loopCount];
		tempValue = '';

		// CHECK FOR VALID XML CHILD
		if(xmlObject.getElementsByTagName(tempKey)[0] != null){

			// SET VALUE
			tempValue = '';

			// CHECK FOR VALID XML FIRST CHILD
			if(xmlObject.getElementsByTagName(tempKey)[0].firstChild != null){

				// CHECK FOR VALID XML FIRST CHILD VALUE
				if(xmlObject.getElementsByTagName(tempKey)[0].firstChild.nodeValue != null){

					// SET VALUE
					tempValue = xmlObject.getElementsByTagName(tempKey)[0].firstChild.nodeValue;

				}

			}

			// DRAW HTML
			html = html+'<input type="hidden" name="'+tempKey+'" id="'+tempKey+'" value="'+tempValue+'">';

			// CHECK
			if(tempKey == 'xmlHash' && typeof xmlObject.getElementsByTagName(tempKey)[0] != 'undefined'){

				// REMOVE XML HASH
				hash = xmlObject.getElementsByTagName(tempKey)[0];
				xmlObject.documentElement.removeChild(hash);

			}

		}

	}

	// CONVERT XML OBJECT TO STRING
	var xmlString = new XMLSerializer().serializeToString(xmlObject.documentElement);

	// REPLACE SELF CLOSING TAGS WITH START AND END TAGS
	xmlString = helcimFormatXML(xmlString);

	// SET
	tempKey = 'includeXML';

	if(xmlObject.getElementsByTagName(tempKey)[0] == null || xmlObject.getElementsByTagName(tempKey)[0].firstChild == null || xmlObject.getElementsByTagName(tempKey)[0].firstChild.nodeValue == null || xmlObject.getElementsByTagName(tempKey)[0].firstChild.nodeValue == 1){

		// PUT XML RESPONSE IN INPUT FIELD
		html = html+'<input type="hidden" name="xml" id="xml" value="'+xmlString+'">';

	}

	// RETURN
	return html;

} // END FUNCTION

//////////////////////////////////////////////////////////////////////////////////////
// FUNCTION - CHECK IF TRANSACTION WAS APPROVED
//////////////////////////////////////////////////////////////////////////////////////
function helcimCheckForApproval(xmlObject){

	// CHECK FOR VALID FIELD
	if(xmlObject.getElementsByTagName('response')[0] != null){

		// CHECK FOR VALID FIELD
		if(xmlObject.getElementsByTagName('response')[0].firstChild != null){

			// CHECK RESPONSE
			if(xmlObject.getElementsByTagName('response')[0].firstChild.nodeValue != null){

				// CHECK RESPONSE
				if(xmlObject.getElementsByTagName('response')[0].firstChild.nodeValue == '1'){

					return true;

				}else{

					return false;

				}

			}else{

				return false;

			}

		}else{

			return false;

		}

	}else{

		return false;

	}

} // END FUNCTION

//////////////////////////////////////////////////////////////////////////////////////
// FUNCTION - CHECK IF TRANSACTION WAS APPROVED
//////////////////////////////////////////////////////////////////////////////////////
function helcimGetReponseMessage(xmlObject){

	// CHECK FOR VALID FIELD
	if(xmlObject.getElementsByTagName('responseMessage')[0].firstChild != null){

		return xmlObject.getElementsByTagName('responseMessage')[0].firstChild.nodeValue;

	}else{

		return 'ERROR: NO RESPONSE DATA';

	}

} // END FUNCTION

//////////////////////////////////////////////////////////////////////////////////////
// FUNCTION - CHECK IF BROWSER CAN HANDLE CROSS-SITE DATA
//////////////////////////////////////////////////////////////////////////////////////
function helcimCheckBrowserSupport(){

	// CHECK FOR CORS SUPPORT WITH CREDENTIALS
	if('withCredentials' in new XMLHttpRequest()){

		// SUPPORTED
		return true;

	}else{

		// NOT SUPPORTED
		return false;

	}

} // END FUNCTION

//////////////////////////////////////////////////////////////////////////////////////
// FUNCTION - CHECK IF SSL CONNECTION IS PRESENT
//////////////////////////////////////////////////////////////////////////////////////
function helcimCheckSSL(){

	// CHECK FOR SSL CONNECTION
	if(document.location.protocol === 'https:'){

		// SECURE
		return true;

	}else{

		// NOT SECURE
		return false;

	}

} // END FUNCTION

//////////////////////////////////////////////////////////////////////////////////////
// FUNCTION - CLEAN CARDHOLDER DATA
//////////////////////////////////////////////////////////////////////////////////////
function helcimCleanCardData(){

	// CLEAN CARD
	if(document.getElementById('cardNumber') != null){ document.getElementById('cardNumber').value = ''; }
	if(document.getElementById('cardExpiry') != null){ document.getElementById('cardExpiry').value = ''; }
	if(document.getElementById('cardExpiryMonth') != null){ document.getElementById('cardExpiryMonth').value = ''; }
	if(document.getElementById('cardExpiryYear') != null){ document.getElementById('cardExpiryYear').value = ''; }
	if(document.getElementById('cardCVV') != null){ document.getElementById('cardCVV').value = ''; }

	// CLEAN BANK ACCOUNT
	if(document.getElementById('bankAccountType') != null){ document.getElementById('bankAccountType').value = ''; }
	if(document.getElementById('bankAccountCorporate') != null){ document.getElementById('bankAccountCorporate').value = ''; }
	if(document.getElementById('bankTransitNumber') != null){ document.getElementById('bankTransitNumber').value = ''; }
	if(document.getElementById('bankAccountNumber') != null){ document.getElementById('bankAccountNumber').value = ''; }
	if(document.getElementById('bankFirstName') != null){ document.getElementById('bankFirstName').value = ''; }
	if(document.getElementById('bankLastName') != null){ document.getElementById('bankLastName').value = ''; }
	if(document.getElementById('bankCompanyName') != null){ document.getElementById('bankCompanyName').value = ''; }
	if(document.getElementById('bankStreetAddress') != null){ document.getElementById('bankStreetAddress').value = ''; }
	if(document.getElementById('bankCity') != null){ document.getElementById('bankCity').value = ''; }
	if(document.getElementById('bankProvince') != null){ document.getElementById('bankProvince').value = ''; }
	if(document.getElementById('bankCountry') != null){ document.getElementById('bankCountry').value = ''; }
	if(document.getElementById('bankPostalCode') != null){ document.getElementById('bankPostalCode').value = ''; }

} // END FUNCTION

//////////////////////////////////////////////////////////////////////////////////////
// FUNCTION - SET LANGUAGE
//////////////////////////////////////////////////////////////////////////////////////
function helcimSetLanguage(){

	// UPDATE FORM ID
	helcimUpdateFormId();

	// SET
	var formObject = document.getElementById(formId);

	// CHECK FORM
	if(formObject != null){

		// SET
		var languageObject = formObject.elements['language'];

		// CHECK LANGUAGE
		if(languageObject != null){

			// CHECK VALUE
			if(typeof languageObject.value == 'string'){

				// SET TEMP LANGUAGE
				var languageValue = languageObject.value;

				// TO LOWER
				languageValue = languageValue.toLowerCase();

				// TRIM
				languageValue = languageValue.trim();

				// CHECK FOR VALID LANGUAGE
				if(languageValue == 'fr'){ language = languageValue; }
				else if(languageValue == 'sp'){ language = languageValue; }
				else if(languageValue == 'en'){ language = languageValue; }

			}

		}

	}


} // END FUNCTION

//////////////////////////////////////////////////////////////////////////////////////
// FUNCTION - GET ERROR
//////////////////////////////////////////////////////////////////////////////////////
function helcimTranslate(message){

	// SET
	var messageResult = message;
	var messageLowerCase = message.toLowerCase();
	var messages = [];
	messages['YOUR BROWSER IS NOT SUPPORTED'.toLowerCase()] = {
			'fr':'VOTRE NAVIGATEUR N\'EST PAS COMPATIBLE',
			'sp':'SU NAVEGADOR NO ES COMPATIBLE'
		};
	messages['CONNECTING'.toLowerCase()] = {
		'fr':'CONNEXION',
		'sp':'CONECTANDO'
	};
	messages['ERROR'.toLowerCase()] = {
		'fr':'ERREUR',
		'sp':'ERROR'
	};
	messages['COMMUNICATION ERROR'.toLowerCase()] = {
		'fr':'ERREUR: PROBLÃˆME DE COMMUNICATION',
		'sp':'ERROR DE COMUNICACION'
	};
	messages['INVALID HELCIM.JS TOKEN'.toLowerCase()] = {
		'fr':'HELCIM.JS JETON NON VALIDE',
		'sp':'TOKEN HELCIMJS INVALIDO'
	};
	messages['INVALID CUSTOMER CODE'.toLowerCase()] = {
		'fr':'CODE DU CLIENT NON VALIDE',
		'sp':'CODIGO DE CLIENTE INVALIDO'
	};
	messages['INVALID CREDIT CARD NUMBER'.toLowerCase()] = {
		'fr':'NUMÃ‰RO DE CARTE DE CRÃ‰DIT NON VALIDE',
		'sp':'NUMERO DE TARJETA DE CREDITO INVALIDO'
	};
	messages['INVALID CREDIT CARD EXPIRY'.toLowerCase()] = {
		'fr':'DATE Dâ€™EXPIRATION NON VALIDE',
		'sp':'FECHA DE EXPIRACION INVALIDA'
	};
	messages['INVALID CREDIT CARD CVV'.toLowerCase()] = {
		'fr':'VVC NON VALIDE',
		'sp':'NUMERO CVV DE TARJETA DE CREDITO INVALIDO'
	};
	messages['BROWSER SSL CERTIFICATE MISSING'.toLowerCase()] = {
		'fr':'CERTIFICAT DE NAVIGUATEUR SSL MANQUANT',
		'sp':'FALTA CERTIFICADO SSL DE NAVEGADOR'
	};
	messages['Processing, Please Wait'.toLowerCase()] = {
		'fr':'En traitement, Veuillez patienter',
		'sp':'Procesando, Favor de Esperar'
	};
	messages['Process Payment'.toLowerCase()] = {
		'fr':'Traiter la Transaction',
		'sp':'Procesar Transaccion'
	};

	// CHECK MESSAGE
	if(typeof messages[messageLowerCase] != 'undefined'){

		// CHECK ERROR BY LANGUAGE
		if(typeof messages[messageLowerCase][language] != 'undefined'){

			// CHECK LENGTH
			if(messages[messageLowerCase][language].length > 0){

				// USE TRANSLATED
				message = messages[messageLowerCase][language];

			}

		}

	}

	// RETURN
	return message;

} // END FUNCTION

//////////////////////////////////////////////////////////////////////////////////////
// FUNCTION - GET FORM ID
//////////////////////////////////////////////////////////////////////////////////////
function helcimUpdateFormId(){

	// CHECK TOKEN
	if(document.getElementById('token') != null){

		// CHECK FORM
		if(document.getElementById('token').form != null && document.getElementById('token').form.tagName == 'FORM'){

			// CHECK FORM ID
			if(typeof document.getElementById('token').form.id == 'string' && document.getElementById('token').form.id.length > 0){

				// UPDATE FORM ID
				formId = document.getElementById('token').form.id;

			}

		}

	}

} // END FUNCTION

//////////////////////////////////////////////////////////////////////////////////////
// FUNCTION - FORMAT XML
//////////////////////////////////////////////////////////////////////////////////////
function helcimFormatXML(xmlString){

	// MATCHES <selfClosingTag1/>
	var pattern = /<([a-z]+[a-z0-9]*)\/>/ig;

	// REPLACE SELF CLOSING TAGS WITH START AND END TAGS
	// <selfClosingTag1></selfClosingTag1>
	var updatedXMLString = xmlString.replace(pattern,"<$1></$1>");

	// RETURN
	return updatedXMLString;

} // END FUNCTION