import { createElement } from "../../jsx-without-react";
import "datatables.net";
import "datatables.net-dt/css/jquery.dataTables.css";
import "./algsLiveStats.scss";
import { getColorBetween, sleep } from "./utils";

export const ALGSLiveStats = () => {
  $("body").append(
    <div id="maincontainer">
      <button id="resetsort">Reset Sorting</button>
      <table id="dataTable" />
    </div>
  );

  var pollCount = 0;
  var pollSpeed = 2000;
  var pollInterval = undefined;

  DEVELOPMENT && $("#maincontainer").prepend(`<h1>DEVELOPMENT MODE</h1>`);

  if (!DEVELOPMENT) pollInterval = setInterval(pollData, pollSpeed);

  function pollData() {
    pollCount++;
    datatable.ajax.reload();
  }

  function getData(_, callback) {
    const API_URL = `https://discover.flowics.com/discover/public/datasources/company/1584/integration_sink/apex-prod-twitch-live/payload/graphics_match`;
    $.ajax({
      method: "GET",
      url: API_URL,
    }).done((response) => {
      callback({ data: response.teams_iterable });
    });
  }

  const defaultOrder = [
    [5, "asc"],
    [0, "asc"],
    [6, "desc"],
    [8, "asc"],
    [3, "desc"],
    [4, "desc"],
  ];

  let datatable = $("#dataTable").DataTable({
    ajax: getData,
    paging: false,
    rowReorder: true,
    columns: [
      { title: "", data: "placement", width: "0%", className: "place" },
      {
        title: "",
        className: "logo",
        render: function (data, type, row) {
          return `<img src=${row?.logo} />`;
        },
        width: "0%",
        sortable: false,
      },
      {
        title: "Name",
        className: "name",
        render: function (data, type, row) {
          return row?.displayName ?? row?.name;
        },
        width: "0%",
      },
      { title: "Kills", data: "kills", width: "0%" },
      { title: "Damage", data: "damage", width: "0%" },
      { title: "Status", data: "status", visible: false, width: "0%" },
      {
        title: "Match Pt",
        data: "matchPoint",
        visible: false,
        className: "matchPoint",
      },
      { title: "Pts", data: "tournamentPoints" },
      {
        title: "",
        data: "tournamentPlace",
        className: "tournamentPlace",
      },
      {
        title: "",
        data: "tournamentPlace",
        className: "placementMarker",
        render: function (data, type, row) {
          let extraRange = 5;
          let placement = Number(data);
          let colorMult;
          if (placement <= 10) colorMult = placement / (20 + extraRange);
          else colorMult = (placement + extraRange) / (20 + extraRange);

          let c = getColorBetween([255, 0, 0], [0, 255, 0], colorMult);
          let rgb = `${c[0]}, ${c[1]}, ${c[2]}`;
          return (
            <span
              style={`background:linear-gradient(90deg,
                      rgba(${rgb}, 0) 0%,
                      rgba(${rgb}, 1) 100%)`}
              class="placementMarker"
            />
          ).outerHTML;
        },
        sortable: false,
      },
    ],
    order: [...defaultOrder],
    bInfo: false,
    createdRow: function (row, data, dataIndex) {
      let dtRow = datatable.row(row);
      dtRow.child(createChild(data));

      $(row).addClass("mainrow");
      if (data?.status === "alive") $(row).addClass("alive");
      if (parseInt(data?.tournamentPlace) <= 10) $(row).addClass("top10");
      if (data?.matchPoint) $(row).addClass("onMatchPoint");
      DEVELOPMENT && $(row).addClass("alive");
    },
  });

  $("#resetsort").on("click", function () {
    datatable.order(defaultOrder).ajax.reload();
  });

  sleep(1000).then(() => $("tr").eq(4).addClass("fighting"));

  // `d` is the original data object for the row
  function createChild(d) {
    return <div>{d.name}</div>;
  }

  $("#dataTable").on("click", "tr", function () {
    var row = datatable.row($(this).closest("tr"));

    if (row.child.isShown()) {
      // This row is already open - close it
      row.child.hide();
      tr.removeClass("shown");
    } else {
      // Open this row
      row.child.show();
      tr.addClass("shown");
    }
  });
};
