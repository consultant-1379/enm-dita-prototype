requirejs(["parser","dtdParts"],function(parser,dtdParts){
	parser.setDTD(dtdParts.DTD);
	parser.parseContent("<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<!DOCTYPE task PUBLIC \"-//OASIS//DTD DITA Task//EN\"\r\n \"../../dtd/technicalContent/dtd/task.dtd\">\r\n<!-- This file is part of the DITA Open Toolkit project hosted on \r\n     Sourceforge.net. See the accompanying license.txt file for \r\n     applicable licenses.-->\r\n<!-- (C) Copyright IBM Corporation 2001, 2005. All Rights Reserved.\r\n *-->\r\n<task id=\"changeoil\" xml:lang=\"en-us\">\r\n<title>Changing the oil in your car</title><shortdesc>Once every 6000 kilometers or three months, change the oil in\r\nyour car.</shortdesc><taskbody>\r\n<context><p>Changing the oil regularly \r\nwill help keep the engine in good condition. </p></context>\r\n<steps>\r\n<stepsection>To change the oil:</stepsection>\r\n<step><cmd>Remove the old oil filter.</cmd></step>\r\n<step><cmd>Drain the old oil.</cmd></step>\r\n<step><cmd>Install a new oil filter and gasket.</cmd></step>\r\n<step><cmd>Add new oil to the engine.</cmd></step>\r\n<step><cmd>Check the air filter and replace or clean it.</cmd></step>\r\n<step><cmd>Top up the windshield washer fluid.</cmd></step>\r\n</steps>\r\n</taskbody>\r\n<related-links>\r\n<link href=\"../concepts/oil.xml\" format=\"dita\" type=\"concept\"></link>\r\n<link href=\"../concepts/wwfluid.xml\" format=\"dita\" type=\"concept\"></link></related-links></task>");
});