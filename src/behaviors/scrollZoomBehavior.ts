///<reference path="../reference.ts" />

module Plottable {
export module Behavior {
  export class ScrollZoom {
    private _scrollInteraction: Interaction.Scroll;
    private _scale: Scale.AbstractQuantitative<number>;

    constructor(scale: Scale.AbstractQuantitative<number>) {
      this._scale = scale;
      this._scrollInteraction = new Interaction.Scroll();
      this._setupInteraction(this._scrollInteraction);
    }

    public getInteraction() {
      return this._scrollInteraction;
    }

    private _setupInteraction(scrollInteraction: Interaction.Scroll) {
      var zoomScale = this._scale.copy();
      var magnifyAmount = 1;
      this._scrollInteraction.onScroll((point: Point, deltaAmount: number) => {
        magnifyAmount = Math.pow(2, -deltaAmount * .002) * magnifyAmount;
        this._scale.domain(ScaleDomainTransformers.magnify(zoomScale, magnifyAmount, point.x));
      });
    }

  }
}
}
