# Geometric Algorithms

Try the app at https://andreihodoroaga.github.io/geometric-algorithms/.

## About the Project

This repository contains the code for a geometric algorithms visualization app built for my bachelor's thesis. It includes fundamental algorithms such as determining the convex hull, triangulating a monotone polygon, and determining the Voronoi diagram.

The app is used as resource in the _Advanced Algorithms_ course, taught in the 2nd year of the Computer Science BS at the _University of Bucharest_.

It is designed to provide a framework that makes it as easy as possible to add new algorithms in the future. The main component that helps achieve this is the `VisualizationEngine`, which is used by almost all algorithms. It provides the basic layout and controls when adding a new algorithm.

## Technologies

- **Core**: React, TypeScript
- **Build Tool**: Vite
- **Testing**: Jest for unit tests, Cypress for end-to-end tests

## Installation

### Prerequisites

- Node.js (version 18 or later will probably be fine)

### Steps

1.  Clone the repository:
    ```bash
    git clone https://github.com/andreihodoroaga/geometric-algorithms.git
    cd geometric-algorithms
    ```
2.  ```bash
    npm i
    ```
3.  ```bash
    npm run dev
    ```
4.  Open your browser and navigate to http://localhost:5173/geometric-algorithms

## Contributing

Please check out the [contribution guide](CONTRIBUTING.md).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
