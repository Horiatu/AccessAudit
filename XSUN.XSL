<?xml version="1.0" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/TR/WD-xsl" >
<xsl:template match="/" >
<html>
<body>
<TABLE DATASRC="#XSUN" BORDER="0" background="SunBG.jpg"> 
  <THEAD>
    <TH Align="Left">Country - State/Province</TH>
    <TH Align="Left">#</TH>
    <TH Align="Left">Office</TH>
  </THEAD>
  <xsl:for-each select="Contacts/Country/State_Province/Office">
  <TR>
  <xsl:if expr="(childNumber(this) == 1)"> 
    <TD VALIGN="TOP" BGColor="#ffccff">
      <b><xsl:value-of select="../../CountryName" /> - <xsl:value-of select="../State_ProvinceName" /> </b>
    </TD>
  </xsl:if>
  <xsl:if expr="(childNumber(this) != 1)"> 
    <TD />
  </xsl:if>
	<TD BGColor="navy">
    <Font Color="White"><b><xsl:eval>childNumber(this)</xsl:eval></b></Font>
    </TD>
    <TD VALIGN="TOP" BGColor="#ccffff">
      <Font Color="Navy"><b><xsl:value-of select="City" /></b></Font><br />
    </TD> 
  </TR>
  <TR>
    <TD />
    <TD bgcolor="#ccffff" />
    <TD VALIGN="TOP" bgcolor="#ccffff">
      <xsl:value-of select="Address1" /><br />

<!--xsl:if expr='Address2 != ""'-->
<xsl:value-of select="Address2" /><!--br />
</xsl:if-->

      <xsl:value-of select="../State_ProvinceCode" />, <xsl:value-of select="../../CountryCode" /> - <xsl:value-of select="Zip" /><br /> 
      <b>Phone: <xsl:value-of select="Phone1" /></b><br /> 
      Toll Free: <xsl:value-of select="TollFree" /><br /> 
      <Small><xsl:value-of select="Registration" /></Small>
    </TD> 
  </TR>
</xsl:for-each> 
</TABLE>
</body>
</html>
</xsl:template> 
</xsl:stylesheet> 
