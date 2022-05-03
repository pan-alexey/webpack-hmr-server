import modulData from "./module";

function renderData(data) {
  document.querySelector("#element-1").innerHTML = data;
}

renderData(modulData);

if (module.hot) {
  module.hot.accept("./module", function () {
    import("./module").then((newData) => {
      renderData(newData.default);
    });
  });
}
