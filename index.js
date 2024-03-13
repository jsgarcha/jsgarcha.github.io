$(function() {
	$("#searchresults").on("change","#checkall", function(){
		$('#searchresults').find("input").not("#checkall").prop("checked", $("#checkall").prop("checked"));
	});
	
	$("#search").click(function() {
		$("#searchresults").empty();
		//let url = API KEY
		url.searchParams.set('q', $("#searchbar").val());
		let request = new XMLHttpRequest();
		request.open("GET", url);
		request.send();
		request.onload = function() {
							if(request.status == 200) {
								var response = JSON.parse(request.response);
								for(let i = 0; i < response.items.length; i++) {
									if(document.getElementById("checkall") == null)
										$("#searchresults").append("<div class='form-check'><input class='form-check-input position-static' type='checkbox' id='checkall'></div>");
									$("<div class='form-check rounded'><input class='form-check-input position-static' type='checkbox'></div>").addClass("bg-light").appendTo("#searchresults")
										.append("<h5>"+response.items[i].title+"</h5>")
										.append("<a href='"+response.items[i].link+"'>"+response.items[i].link+"</a>")
										.append("<p>"+(response.items[i].pagemap.metatags[0]["og:description"] == null ? response.items[i].snippet : response.items[i].pagemap.metatags[0]["og:description"])+"</p>");					
								}
							}
						};
	});
		
	$(".download").click(function() {
		var data='';
		var title, url, description;
		var filename = $("#downloadfilename").val();
		var fileformat = $("#fileselect").val();
		var mime;
		var checked = $("input:checked").not("#checkall");		
		
		if($("#searchresults").children().length == 0) 
			$(".invalid-feedback").text("There are no search results to download.").show();
		
		if($(checked).length == 0 && $("#searchresults").children().length != 0) {
			$("#fileselect").removeClass("is-invalid").removeClass("is-valid");
			$("#downloadfilename").removeClass("is-invalid").removeClass("is-valid");
			$(".invalid-feedback").text("Please select at least one search result checkbox.").show();
		}
		
		if($("#searchresults").children().length != 0 && $(checked).length != 0 && fileformat == "File Format" && !$("#downloadfilename").hasClass("is-invalid")) {
			$("#fileselect").addClass("is-invalid");
			$(".invalid-feedback").text("Please select a file format: .csv, .json, .xml.").show();
		}
		
		if($("#searchresults").children().length != 0 && $(checked).length != 0 && filename == "" && !$("#fileselect").hasClass("is-invalid")) {
			$("#downloadfilename").addClass("is-invalid");
			$(".invalid-feedback").text("Please enter a file name.").show();
		}
		
		if($("#searchresults").children().length != 0 && $(checked).length != 0 && filename == "" && fileformat == "File Format") {
			$("#fileselect").addClass("is-invalid");
			$("#downloadfilename").addClass("is-invalid");
			$(".invalid-feedback").text("Please enter a file name and select a file format: .csv, .json, .xml.").show();
		}		

		if(filename != "" && fileformat != "File Format" && $(checked).length != 0) {
			$("#fileselect").removeClass("is-invalid").removeClass("is-valid");
			$("#downloadfilename").removeClass("is-invalid").removeClass("is-valid");
			$(".invalid-feedback").hide();			
			for(let i = 0; i < checked.length; i++) {
				title = $(checked[i]).siblings("h5").text().replace(/\s+/g, " ").trim();
				url = $(checked[i]).siblings("a").text().replace(/\s+/g, " ").trim();
				description = $(checked[i]).siblings("p").text().replace(/\s+/g, " ").trim();
				if(fileformat == ".csv") {
					mime = "text/csv";
					data += title+","+url+","+description+"\n";
				}
				if(fileformat == ".json") {
					mime = "application/json";
					data += '\t\t\t  \t' + '{"title": "'+title+'", "url": "'+url+'", "description": "'+description+'"},' + '\n';
					if(i == checked.length - 1) {
						data += '\t\t\t  \t' + '{"title": "'+title+'", "url": "'+url+'", "description": "'+description+'"}' + '\n';
						data = '{\n' + 
									'\t"Result": [\n' + 
													data +
										'\t\t\t  ]\n' +
							   '}';
					}
				}				
				if(fileformat == ".xml") {
					mime = "text/xml";
					data += "\t<result>\n" +
								"\t\t<title>"+title+"</title>\n" +
								"\t\t<url>"+url+"</url>\n" +
								"\t\t<description>"+description+"</description>\n" +
							"\t</result>\n";
					if(i == checked.length - 1) {
						data =  '<?xml version="1.0" encoding="UTF-8"?>\n' + 
								"<results>\n" +
									data +
								"</results>";
					}
				}
			}	
			var dl = document.createElement("a");
			dl.setAttribute("href", "data:"+mime+","+encodeURIComponent(data));
			dl.setAttribute("download", filename+fileformat);
			dl.style.display = "none";
			document.body.appendChild(dl);
			dl.click();
			document.body.removeChild(dl);		
		}			
	});	
	
	$("#fileselect").change(function() {
		if($(this).val() != "File Format" && $(this).hasClass("is-invalid")) {
			$(this).removeClass("is-invalid").addClass("is-valid");
		}
	});
	
	$("#downloadfilename").keyup(function() {
		if($(this).val() != "" && $(this).hasClass("is-invalid")) {
			$(this).removeClass("is-invalid").addClass("is-valid");
		}
	});

	$(".upload").click(function() {
		$("#fileinput").click();
	});
	
	$("#fileinput").change(function() {
		const filelist = this.files; 
		for (let i = 0; i < filelist.length; i++) {
			var title, url, description; 
			let reader = new FileReader();
			let file = filelist[i];
			reader.readAsText(file);
			reader.onload = function() {
				if(file.type === "text/csv" || file.type === "application/vnd.ms-excel") {
					$(".invalid-feedback").hide();
					if(document.getElementById("checkall") == null)
						$("#searchresults").append("<div class='form-check'><input class='form-check-input position-static' type='checkbox' id='checkall'></div>");
					var lines = reader.result.split("\n");
					for(let i = 0; i < lines.length; i++) {
						if(lines[i] != "") {
							var values = lines[i].split(",");
							title = values[0];
							url = values[1];
							description = values[2];
							$("<div class='form-check rounded'><input class='form-check-input position-static' type='checkbox'></div>").addClass("bg-light").appendTo("#searchresults")
								.append("<h5>"+title+"</h5>")
								.append("<a href='"+url+"'>"+url+"</a>")
								.append("<p>"+description+"</p>");
						}
					}
				}			
				if(file.type === "application/json") {
					$(".invalid-feedback").hide();
					if(document.getElementById("checkall") == null)
						$("#searchresults").append("<div class='form-check'><input class='form-check-input position-static' type='checkbox' id='checkall'></div>");					
					var json = JSON.parse(reader.result);
					for(let i = 0; i < json.Result.length; i++) {
						title = json.Result[i].title;
						url = json.Result[i].url;
						description = json.Result[i].description;
						$("<div class='form-check rounded'><input class='form-check-input position-static' type='checkbox'></div>").addClass("bg-light").appendTo("#searchresults")
							.append("<h5>"+title+"</h5>")
							.append("<a href='"+url+"'>"+url+"</a>")
							.append("<p>"+description+"</p>");
					}
				}						
				if(file.type === "text/xml") {
					$(".invalid-feedback").hide();
					if(document.getElementById("checkall") == null)
						$("#searchresults").append("<div class='form-check'><input class='form-check-input position-static' type='checkbox' id='checkall'></div>");	
					let parser = new DOMParser();
					let xml = parser.parseFromString(reader.result, "text/xml");
					for(let i = 0; i < xml.getElementsByTagName("result").length; i++) {
						title = xml.getElementsByTagName("title")[i].childNodes[0].nodeValue;
						url = xml.getElementsByTagName("url")[i].childNodes[0].nodeValue;
						description = xml.getElementsByTagName("description")[i].childNodes[0].nodeValue;
						$("<div class='form-check rounded'><input class='form-check-input position-static' type='checkbox'></div>").addClass("bg-light").appendTo("#searchresults")
							.append("<h5>"+title+"</h5>")
							.append("<a href='"+url+"'>"+url+"</a>")
							.append("<p>"+description+"</p>");
					}
				}
				if(!(file.type === "text/csv" || file.type === "application/vnd.ms-excel" || file.type === "application/json" || file.type === "text/xml")) {
					$(".invalid-feedback").text("Please upload a .csv, .json, or .xml file.").show();
				}
			};			
		}
	});

	$(".dropdown-menu [data-toggle='dropdown']").click(function(event) {
		event.preventDefault();
		event.stopPropagation();
    	$(this).parents(".dropdown-submenu").siblings().find(".show").removeClass("show");    
   		$(this).siblings().toggleClass("show");    
    	$(this).parents(".nav-item.dropdown.show").on("hidden.bs.dropdown", function() {
      		$(".dropdown-submenu.show").removeClass("show");
    	});
  	});
	
	$(".nav-link.dropdown").click(function(){
		$("#verticalnav").empty();
		$("#verticalnav").html($(this).siblings().html());
		$("#verticalnav")
						.children(".dropdown-submenu").removeClass("dropdown-submenu").addClass("nav-item")
						.children("a").removeClass().addClass("nav-item nav-link collapsed").attr("data-toggle", "collapse")
						.siblings().removeClass().addClass("collapse")
						.children().removeClass().addClass("flex-column pl-2 nav")
						.children().removeClass().addClass("nav-item nav-link text-light text-wrap");
	});
		
	var navigatormenu = document.getElementById("navigator");
	navigatormenu.children[0].innerHTML += navigator.appName;
	navigatormenu.children[1].innerHTML += navigator.appVersion;
	navigatormenu.children[2].innerHTML += navigator.userAgent;
	navigatormenu.children[3].innerHTML += navigator.platform;
	navigatormenu.children[4].innerHTML += navigator.language;

	var windowmenu = document.getElementById("window");
	windowmenu.children[0].innerHTML += (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)+" pixels";
	windowmenu.children[1].innerHTML += (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)+" pixels";

	var screenmenu = document.getElementById("screen");
	screenmenu.children[0].innerHTML += screen.height+" pixels";
	screenmenu.children[1].innerHTML += screen.width+" pixels";
	screenmenu.children[2].innerHTML += screen.availWidth+" pixels";
	screenmenu.children[3].innerHTML += screen.availHeight+" pixels";
	screenmenu.children[4].innerHTML += screen.colorDepth+" bit";
	screenmenu.children[5].innerHTML += screen.pixelDepth+" bit";

	var locationmenu = document.getElementById("location");
	locationmenu.children[0].innerHTML += window.location.href;
	locationmenu.children[1].innerHTML += window.location.hostname;
	locationmenu.children[2].innerHTML += window.location.pathname;
	locationmenu.children[3].innerHTML += window.location.protocol;

	$(".geolocation").click(function() {
		if($("#geolocation").children()[0].innerHTML == "Latitude: " && $("#geolocation").children()[1].innerHTML== "Longitude: ") {
			if (navigator.geolocation) {	
				navigator.geolocation.getCurrentPosition(function(position) {
					$("#geolocation").children()[0].innerHTML += position.coords.latitude+"&deg;";
					$("#geolocation").children()[1].innerHTML += position.coords.longitude+"&deg;"; 
				}); 
			}
		}
	});
});