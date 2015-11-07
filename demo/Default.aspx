<%@ Page Language="C#" Inherits="SimpleCMS.Page" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head runat="server">
	<link rel="stylesheet" type="text/css" href="http://housemark.co/css/housemark-default.css?v=1.0" media="all"/>
	<title>Housemark - Games Page</title>
	<style>
		#siblings a{
			display:block;
		}
	</style>
	<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-24373547-1']);
  _gaq.push(['_setDomainName', '.Housemark.co']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>
</head>
<body>
<div id="content">
	<header>
		<img src="http://housemark.co/images/translogo_fff.png" alt="housemark logo" id="mainlogo"/>
	</header>
	<div id="data">
	
	<h2>Demos</h2>
	<p>Pretty much what you might expect. Woohoo.</p>
	<h3>Entries</h3>
	<nav id="subfolder" runat="server"></nav>
	
	
	<footer id="final">
		<div class="right" id="followus">
		<a href="http://twitter.com/HousemarkCo" class="twitter-follow-button" data-show-count="false" data-link-color="50aeff">Follow @HousemarkCo</a>
			
		</div>
		<p>&copy;  <a href="mailto:info@housemark.co">Housemark Co</a></p>
		
	</footer>
</div>
</body>
</html>
