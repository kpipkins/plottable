///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Line extends AbstractDrawer {
    public static LINE_CLASS = "line";

    private _pathSelection: D3.Selection;

    protected _enterData(data: any[]) {
      super._enterData(data);
      this._pathSelection.datum(data);
    }

    public setup(area: D3.Selection) {
      this._pathSelection = area.append("path")
                               .classed(Line.LINE_CLASS, true)
                               .style({
                                 "fill": "none",
                                 "vector-effect": "non-scaling-stroke"
                               });
      super.setup(area);
    }

    private _createLine(xFunction: _AppliedProjector, yFunction: _AppliedProjector, definedFunction: _AppliedProjector) {
      if(!definedFunction) {
        definedFunction = (d, i) => true;
      }

      return d3.svg.line()
                   .x(xFunction)
                   .y(yFunction)
                   .defined(definedFunction);
    }

    protected _numberOfAnimationIterations(data: any[]): number {
      return 1;
    }

    protected _drawStep(step: AppliedDrawStep) {
      var baseTime = super._drawStep(step);
      var attrToProjector = <_AttributeToAppliedProjector>_Util.Methods.copyMap(step.attrToProjector);
      var definedFunction = attrToProjector["defined"];

      var xProjector = attrToProjector["x"];
      var yProjector = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y"];
      if (attrToProjector["defined"]) {
        delete attrToProjector["defined"];
      }

      attrToProjector["d"] = this._createLine(xProjector, yProjector, definedFunction);
      if (attrToProjector["fill"]) {
        this._pathSelection.attr("fill", attrToProjector["fill"]); // so colors don't animate
      }

      step.animator.animate(this._pathSelection, attrToProjector);

      // Restore classes that may have been overridden by class projectors
      this._pathSelection.classed(Line.LINE_CLASS, true);
    }

    public _getSelector() {
      return "." + Line.LINE_CLASS;
    }

    public _getPixelPoint(datum: any, index: number): Point {
      return { x: this._attrToProjector["x"](datum, index), y: this._attrToProjector["y"](datum, index) };
    }

    public _getSelection(index: number): D3.Selection {
      return this._getRenderArea().select(this._getSelector());
    }

    public _isSelectionInBounds(selection: D3.Selection, xExtent: Extent, yExtent: Extent, tolerance: number): boolean {
      var lineSegments = d3.pairs(selection.data().map((datum, index) => this._getPixelPoint(datum, index)));
      lineSegments = lineSegments.filter((lineSegment: Point[]) => {
        return _Util.Methods.inRange(lineSegment[0].x, xExtent.min, xExtent.max);
      });
      lineSegments.some((lineSegment: Point[]) => {
        var startPoint = lineSegment[0].x <= lineSegment[1].x ? lineSegment[0] : lineSegment[1];
        var endPoint = lineSegment[0].x > lineSegment[1].x ? lineSegment[0] : lineSegment[1];
        if (_Util.Methods.inRange(startPoint.x, xExtent.min, xExtent.max) &&
            _Util.Methods.inRange(startPoint.y, yExtent.min, yExtent.max)) {
          return true;
        } else if (_Util.Methods.inRange(endPoint.x, xExtent.min, xExtent.max) &&
                   _Util.Methods.inRange(endPoint.y, yExtent.min, yExtent.max)) {
          return true;
        } else {
          var topSegment = [{x: xExtent.min, y: yExtent.min}, {x: xExtent.max, y: yExtent.min}];
          var leftSegment = [{x: xExtent.min, y: yExtent.min}, {x: xExtent.min, y: yExtent.max}];
          var rightSegment = [{x: xExtent.max, y: yExtent.min}, {x: xExtent.max, y: yExtent.max}];
          var bottomSegment = [{x: xExtent.min, y: yExtent.max}, {x: xExtent.max, y: yExtent.max}];
          var extentSegments = [topSegment, leftSegment, rightSegment, bottomSegment];
          return extentSegments.some((segment: Point[]) => {
            return _Util.Methods.isIntersecting(segment, lineSegment);
          });
        }
      });
      return true;
    }

    private static pointDistance(x1: number, y1: number, x2: number, y2: number) {
      return Math.pow(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2), 0.5);
    }
  }
}
}
