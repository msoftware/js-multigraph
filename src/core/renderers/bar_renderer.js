// The Bar renderer is a 1-variable renderer which draws a bar at each
// non-missing data point with an outline around the bar and a solid
// fill between the bar and the horizontal axis.
// 
// This renderer accepts the following options:
// 
//     OPTION NAME:          barwidth
//     DATA TYPE:            DataMeasure
//     DEFAULT VALUE:        ???
//     DESCRIPTION:          Width, in relative terms to the type of the
//                           axis the plot is on, of the bars.
//                           
//     OPTION NAME:          baroffset
//     DATA TYPE:            number
//     DEFAULT VALUE:        0
//     DESCRIPTION:          The offset, in pixels, of the left edge of
//                           each bar from the corresponding data value.
//                           
//     OPTION NAME:          barbase
//     DATA TYPE:            DataValue
//     DEFAULT VALUE:        null
//     DESCRIPTION:          The location, relative to the plot's
//                           vertical axis, of the bottom of the bar; if
//                           no barbase is specified, the bars will
//                           extend down to the bottom of the plot area.
//                           
//     OPTION NAME:          linecolor
//     DATA TYPE:            RGBColor
//     DEFAULT VALUE:        0x000000 (black)
//     DESCRIPTION:          The color to be used for the outline around
//                           each bar.
// 
//     OPTION NAME:          fillcolor
//     DATA TYPE:            RGBColor
//     DEFAULT VALUE:        0x000000 (black)
//     DESCRIPTION:          The color to be used for the fill inside
//                           each bar; if barbase is specified, this
//                           color is used only for bars that extend
//                           above the base.
// 
//     OPTION NAME:          fillopacity
//     DATA TYPE:            number
//     DEFAULT VALUE:        1
//     DESCRIPTION:          Opacity used for the fill inside each bar.
// 
//     OPTION NAME:          hidelines
//     DATA TYPE:            number
//     DEFAULT VALUE:        2
//     DESCRIPTION:          Bars which are less wide, in pixels, than
//                           this number do not render their outlines.
//                           
window.multigraph.util.namespace("window.multigraph.core", function (ns) {
    "use strict";

    var BarRenderer,
        defaultValues = window.multigraph.utilityFunctions.getDefaultValuesFromXSD(),
        attributes = window.multigraph.utilityFunctions.getKeys(defaultValues.plot.renderer);

    BarRenderer = new window.jermaine.Model( "BarRenderer", function () {
        this.isA(ns.Renderer);
        this.hasA("numberOfVariables").which.defaultsTo(2);
    });

    ns.Renderer.declareOptions(BarRenderer, "BarRendererOptions", [
        {
            "name"          : "barwidth",
            "type"          : ns.Renderer.HorizontalDataMeasureOption,
            "default"       : new ns.DataMeasure.parse("number", 0)
        },
        {
            "name"          : "baroffset",
            "type"          : ns.Renderer.NumberOption,
            "default"       : 0
        },
        {
            "name"          : "barbase",
            "type"          : ns.Renderer.VerticalDataValueOption,
            "default"       : null
        },
        {
            "name"          : "fillcolor",
            "type"          : ns.Renderer.RGBColorOption,
            "default"       : new window.multigraph.math.RGBColor(0,0,0)
        },
        {
            "name"          : "fillopacity",
            "type"          : ns.Renderer.NumberOption,
            "default"       : 1.0
        },
        {
            "name"          : "linecolor",
            "type"          : ns.Renderer.RGBColorOption,
            "default"       : new window.multigraph.math.RGBColor(0,0,0)
        },
        {
            "name"          : "hidelines",
            "type"          : ns.Renderer.NumberOption,
            "default"       : 2
        }
    ]);

    ns.Renderer.BAR = new ns.Renderer.Type("bar");

    ns.Renderer.addType({"type"  : ns.Renderer.Type.parse("bar"),
                         "model" : BarRenderer});

    ns.BarRenderer = BarRenderer;
});
