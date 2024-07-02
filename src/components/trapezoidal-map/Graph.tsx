/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from "react";
import * as d3 from "d3";
import { RED_COLOR } from "../../shared/util";

interface TreeNode {
  name: string;
  children?: TreeNode[];
  parent?: TreeNode;
  id?: number;
  depth?: number;
  x?: number;
  y?: number;
}

interface GraphProps {
  treeData: any;
  svgWidth: number;
  svgHeight: number;
}

const Graph: React.FC<GraphProps> = ({ treeData, svgWidth, svgHeight }) => {
  d3.selectAll(".graph-visualizer svg").remove();

  const svgContainerRef = useRef<HTMLDivElement>(null);

  const drawGraph = (treeData: any | null, svgWidth: number) => {
    if (!treeData) {
      return;
    }

    const width = svgWidth;
    const height = svgHeight;

    const treeLayout = d3.tree<TreeNode>().size([width, height]);

    const svg = d3
      .select(svgContainerRef.current as HTMLDivElement)
      .append("svg")
      .style("width", width)
      .style("height", height)
      .call(d3.zoom<any, unknown>().scaleExtent([1, 3]))
      .on("zoom", function (event) {
        svg.attr("transform", event.transform.toString());
      })
      .append("g")
      .attr("transform", "translate(0,50)");

    const data = treeData.element;
    const root = d3.hierarchy<TreeNode>(data);
    const nodes = treeLayout(root).descendants();
    const links = treeLayout(root).links();

    nodes.forEach((d) => {
      d.y = d.depth * 70;
    });

    let nodeIndex = 0;

    const nodeSelection = svg.selectAll("g.node").data(nodes, (d: any) => {
      if (!d.id) d.id = ++nodeIndex;
      return d.id;
    });

    const nodeEnter = nodeSelection
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
      .on("click", function (_, d: any) {
        highlightNodeAndLink(d);
      });

    nodeEnter
      .append("circle")
      .attr("r", 5)
      .attr("id", (d) => `node${d.id}`)
      .style("fill", (d) => (d.children ? "#17252A" : "rgb(82, 171, 152)"))
      .style("stroke", (d) => (d.children ? "#17252A" : "rgb(82, 171, 152)"));

    nodeEnter
      .append("text")
      .attr("y", -18)
      .attr("x", (d) => {
        if (!d.parent) {
          return 0;
        }
        const isLeftChild = d.parent.children && d.parent.children[0] === d;
        return isLeftChild ? -10 : 10;
      })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .text((d) => d.data.name)
      .style("fill-opacity", 1);

    svg
      .selectAll("path.link")
      .data(links, (d: any) => d.target.id)
      .enter()
      .insert("path", "g")
      .attr("class", "link")
      .attr("id", (d: any) => `link${d.source.id}-${d.target.id}`)
      .attr(
        "d",
        d3
          .linkVertical<any, any>()
          .x((d: any) => d.x)
          .y((d: any) => d.y)
      )
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1);
  };

  const highlightNodeAndLink = (d: TreeNode) => {
    d3.selectAll("circle").style("fill", "white");
    d3.selectAll("circle").style("stroke", d.children ? "#17252A" : "rgb(82, 171, 152)");
    d3.selectAll("path").style("stroke", "#ccc");

    let childPositionIndex = 0;

    while (d) {
      d3.select(`#node${d.id}`).style("fill", RED_COLOR).style("stroke", RED_COLOR);
      if (d.children && d.children[childPositionIndex]) {
        const child = d.children[childPositionIndex];
        d3.select(`#link${d.id}-${child.id}`).style("stroke", RED_COLOR);
        d = child;
        childPositionIndex++;
      } else {
        break;
      }
    }
  };

  drawGraph(treeData, svgWidth);

  return <div ref={svgContainerRef}></div>;
};

export default Graph;
