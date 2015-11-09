<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/xhtml">
<xsl:output method="html"/>
<xsl:template match="/">
  <html>
  	<HEAD>
	<TITLE>Accsessibility Audity</TITLE>
	</HEAD>
	<body>
		<h2>Accsessibility Audity</h2>
		<xsl:apply-templates/>
	</body>
	</html>
</xsl:template>

<xsl:template match="results">
	<xsl:for-each select="fail/severe/rule">
		<h2><xsl:value-of select="title" /></h2>
		<p><xsl:value-of select="description" /></p><br/>
	</xsl:for-each>
</xsl:template>

</xsl:stylesheet>