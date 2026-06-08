import { BaseSolver } from "@tscircuit/solver-utils"
import type { GraphicsObject } from "graphics-debug"
import type { SimpleRouteJson } from "./types/srj-types"

export interface BgaTopologyGeneratorOptions {
  simpleRouteJson: SimpleRouteJson
}

export interface BgaTopologyGeneratorOutput {
  simpleRouteJson: SimpleRouteJson
}

export class BgaTopologyGenerator extends BaseSolver {
  private output: BgaTopologyGeneratorOutput | null = null

  constructor(readonly options: BgaTopologyGeneratorOptions) {
    super()
  }

  override getConstructorParams() {
    return [this.options] as const
  }

  override _step() {
    if (this.output) {
      this.solved = true
      return
    }

    const { simpleRouteJson } = this.options
    this.output = {
      simpleRouteJson: structuredClone(simpleRouteJson),
    }
    this.stats = {
      layerCount: simpleRouteJson.layerCount,
      obstacleCount: simpleRouteJson.obstacles.length,
      connectionCount: simpleRouteJson.connections.length,
      bounds: simpleRouteJson.bounds,
    }
    this.solved = true
  }

  override getOutput(): BgaTopologyGeneratorOutput {
    if (!this.output) {
      throw new Error("BgaTopologyGenerator has not solved yet")
    }

    return this.output
  }

  override visualize(): GraphicsObject {
    const { bounds, obstacles, connections } = this.options.simpleRouteJson

    return {
      title: "BgaTopologyGenerator Input",
      coordinateSystem: "cartesian",
      rects: [
        {
          center: {
            x: (bounds.minX + bounds.maxX) / 2,
            y: (bounds.minY + bounds.maxY) / 2,
          },
          width: bounds.maxX - bounds.minX,
          height: bounds.maxY - bounds.minY,
          stroke: "black",
          fill: "transparent",
        },
        ...obstacles.map((obstacle) => ({
          center: obstacle.center,
          width: obstacle.width,
          height: obstacle.height,
          stroke: "#444",
          fill: "rgba(68,68,68,0.18)",
        })),
      ],
      points: connections.flatMap((connection, connectionIndex) =>
        connection.pointsToConnect.map((point, pointIndex) => ({
          x: point.x,
          y: point.y,
          label: point.pointId ?? `${connection.name}-${pointIndex}`,
          color: connectionIndex % 2 === 0 ? "#d62728" : "#1f77b4",
        })),
      ),
    }
  }
}
