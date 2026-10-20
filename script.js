(function () {
  "use strict";

  var ICON = {
    folder: '<svg class="ic" width="16" height="13" viewBox="0 0 16 13" shape-rendering="crispEdges"><path d="M0.5 0.5H6l1.5 2H15.5V12.5H0.5Z" fill="#f5d271" stroke="#000"/><path d="M0.5 4.5H15.5V12.5H0.5Z" fill="#ffce6b" stroke="#000"/></svg>',
    photo: '<svg class="ic" width="16" height="14" viewBox="0 0 16 14" shape-rendering="crispEdges"><rect x="0.5" y="0.5" width="15" height="13" fill="#fff" stroke="#000"/><rect x="2" y="2" width="12" height="10" fill="#6fb7e9"/><circle cx="5.5" cy="5.2" r="1.7" fill="#ffe000" stroke="#a07000" stroke-width=".6"/><path d="M2 12 L6.5 7 L9.5 10 L11.5 8 L14 12Z" fill="#2e8b3a" stroke="#000" stroke-width=".6"/></svg>',
    computer: '<svg class="ic" width="16" height="14" viewBox="0 0 16 14" shape-rendering="crispEdges"><rect x="1.5" y="1" width="13" height="9" fill="#c0c0c0" stroke="#000"/><rect x="3" y="2.5" width="10" height="6" fill="#008080"/><rect x="5" y="11" width="6" height="2" fill="#808080" stroke="#000" stroke-width=".5"/></svg>'
  };

  var FILES = [
    "flower1.jpg",
    "moon1.jpg", "moon2.jpg", "moon3.jpg", "moon4.jpg", "moon5.jpg",
    "pigon1.jpg", "pigon2.jpg", "pigon3.jpg", "pigon4.jpg",
    "plant1.jpg", "plant2.jpg", "plant3.jpg",
    "sky1.jpg", "sky2.jpg", "sky3.jpg",
    "squirrel1.jpg", "squirrel2.jpg",
    "tree1.jpg"
  ];

  var FOLDERS = [
    { id: "all", name: "My Photos", path: "C:\\My Photos", parent: null },
    { id: "moons", name: "Moons", path: "C:\\My Photos\\Moons", parent: "all" },
    { id: "skies", name: "Skies", path: "C:\\My Photos\\Skies", parent: "all" },
    { id: "pigeons", name: "Pigeons", path: "C:\\My Photos\\Pigeons", parent: "all" },
    { id: "plants", name: "Plants", path: "C:\\My Photos\\Plants", parent: "all" },
    { id: "squirrels", name: "Squirrels", path: "C:\\My Photos\\Squirrels", parent: "all" }
  ];

  function folderOf(f) {
    if (f.indexOf("moon") === 0) return "moons";
    if (f.indexOf("sky") === 0) return "skies";
    if (f.indexOf("pigon") === 0) return "pigeons";
    if (f.indexOf("squirrel") === 0) return "squirrels";
    return "plants";
  }
  function folderById(id) {
    for (var i = 0; i < FOLDERS.length; i++) if (FOLDERS[i].id === id) return FOLDERS[i];
    return FOLDERS[0];
  }

  var $ = function (s) { return document.querySelector(s); };
  var explorer = $("#win-explorer"), viewer = $("#win-viewer"), shutdownWin = $("#win-shutdown");
  var tree = $("#tree"), grid = $("#grid"), addrPath = $("#addr-path"), expTitle = $("#exp-title");
  var statusCount = $("#status-count");
  var btnBack = $("#btn-back"), btnFwd = $("#btn-fwd"), btnUp = $("#btn-up");
  var viewerImg = $("#viewer-img"), viewerTitle = $("#viewer-title"), viewerPage = $("#viewer-page");
  var btnPrev = $("#btn-prev"), btnNext = $("#btn-next");
  var tasks = $("#tasks"), startBtn = $("#start-btn"), startmenu = $("#startmenu");

  $("#exp-title-icon").innerHTML = ICON.photo;
  $("#view-title-icon").innerHTML = ICON.photo;
  $("#addr-icon").innerHTML = ICON.folder;
  $("#sm-icon").innerHTML = ICON.photo;
  $("#sd-icon").innerHTML = ICON.computer;
  $("#sd-icon2").innerHTML = ICON.computer;

  var curFolder = "all", selIdx = -1, list = [];
  var hist = ["all"], hpos = 0;

  function filesIn(id) {
    return FILES.filter(function (f) { return id === "all" || folderOf(f) === id; });
  }

  function renderTree() {
    tree.innerHTML = FOLDERS.map(function (f) {
      return '<div class="tree-item' + (f.id === curFolder ? " sel" : "") + '" data-f="' + f.id +
        '" style="padding-left:' + (f.parent ? 22 : 4) + 'px">' + (f.parent ? ICON.folder : ICON.photo) +
        f.name + "</div>";
    }).join("");
  }

  function renderGrid() {
    list = filesIn(curFolder);
    grid.innerHTML = list.map(function (f, i) {
      return '<div class="thumb" data-i="' + i + '"><div class="thumb-img"><img src="assets/' + f +
        '" alt="' + f + '" loading="lazy"></div><div class="label">' + f + "</div></div>";
    }).join("");
    statusCount.textContent = list.length + " object(s)";
    selIdx = -1;
  }

  function renderFolder(id, push) {
    curFolder = id;
    var fo = folderById(id);
    addrPath.textContent = fo.path;
    expTitle.textContent = fo.name;
    renderTree();
    renderGrid();
    btnUp.disabled = !fo.parent;
    if (push) {
      hist = hist.slice(0, hpos + 1);
      if (hist[hist.length - 1] !== id) { hist.push(id); hpos = hist.length - 1; }
    }
    btnBack.disabled = hpos <= 0;
    btnFwd.disabled = hpos >= hist.length - 1;
  }

  function navHist(delta) {
    var p = hpos + delta;
    if (p < 0 || p >= hist.length) return;
    hpos = p;
    renderFolder(hist[hpos], false);
  }

  btnBack.addEventListener("click", function () { navHist(-1); });
  btnFwd.addEventListener("click", function () { navHist(1); });
  btnUp.addEventListener("click", function () {
    var p = folderById(curFolder).parent;
    if (p) renderFolder(p, true);
  });

  tree.addEventListener("click", function (e) {
    var item = e.target.closest(".tree-item");
    if (item) renderFolder(item.dataset.f, true);
  });

  grid.addEventListener("click", function (e) {
    var t = e.target.closest(".thumb");
    Array.prototype.forEach.call(grid.children, function (c) { c.classList.remove("sel"); });
    if (!t) { selIdx = -1; return; }
    t.classList.add("sel");
    selIdx = +t.dataset.i;
  });

  grid.addEventListener("dblclick", function (e) {
    var t = e.target.closest(".thumb");
    if (t) openViewer(+t.dataset.i);
  });

  var vIdx = 0;

  function updateViewer() {
    var f = list[vIdx];
    viewerImg.src = "assets/" + f;
    viewerImg.alt = f;
    viewerTitle.textContent = f;
    viewerPage.textContent = "Page " + (vIdx + 1) + " of " + list.length;
    btnPrev.disabled = vIdx <= 0;
    btnNext.disabled = vIdx >= list.length - 1;
  }

  function openViewer(i) {
    vIdx = i;
    updateViewer();
    openWin(viewer);
  }

  btnPrev.addEventListener("click", function () { if (vIdx > 0) { vIdx--; updateViewer(); } });
  btnNext.addEventListener("click", function () { if (vIdx < list.length - 1) { vIdx++; updateViewer(); } });

  var zTop = 10;

  function openWins() {
    return Array.prototype.slice.call(document.querySelectorAll(".window[data-task]")).filter(function (w) {
      return !w.dataset.closed;
    });
  }

  function activeWin() {
    var shown = Array.prototype.slice.call(document.querySelectorAll(".window")).filter(function (w) {
      return !w.classList.contains("hidden");
    });
    var best = null;
    shown.forEach(function (w) {
      var z = +w.style.zIndex || 0;
      if (!best || z > best.z) best = { w: w, z: z };
    });
    return best ? best.w : null;
  }

  function raise(w) {
    zTop++;
    w.style.zIndex = zTop;
    document.querySelectorAll(".window").forEach(function (x) {
      var tb = x.querySelector(".titlebar");
      if (tb) tb.classList.toggle("inactive", x !== w);
    });
    syncTasks();
  }

  function syncTasks() {
    tasks.innerHTML = openWins().map(function (w) {
      var label = w.querySelector(".title").textContent;
      var active = w === activeWin() && !w.classList.contains("hidden");
      return '<button class="task-btn' + (active ? " active" : "") + '" data-win="' + w.id + '">' +
        ICON.photo + "<span>" + label + "</span></button>";
    }).join("");
  }

  function openWin(w) {
    w.classList.remove("hidden");
    delete w.dataset.closed;
    delete w.dataset.min;
    raise(w);
  }

  function closeWin(w) {
    w.classList.add("hidden");
    w.dataset.closed = "1";
    var top = activeWin();
    if (top) raise(top);
    syncTasks();
  }

  function minimizeWin(w) {
    w.classList.add("hidden");
    w.dataset.min = "1";
    var top = activeWin();
    if (top) raise(top);
    syncTasks();
  }

  tasks.addEventListener("click", function (e) {
    var b = e.target.closest(".task-btn");
    if (!b) return;
    var w = document.getElementById(b.dataset.win);
    if (w.classList.contains("hidden")) openWin(w);
    else if (w === activeWin()) minimizeWin(w);
    else raise(w);
  });

  document.querySelectorAll(".window").forEach(function (w) {
    w.addEventListener("mousedown", function () {
      if (!w.classList.contains("hidden")) raise(w);
    });
    w.querySelectorAll(".tbtn").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var act = b.dataset.act;
        if (act === "close") closeWin(w);
        else if (act === "min") minimizeWin(w);
        else if (act === "max") toggleMax(w);
      });
    });
  });

  function toggleMax(w) {
    if (w.dataset.maxed) {
      var prev = JSON.parse(w.dataset.prev);
      w.style.left = prev.left; w.style.top = prev.top;
      w.style.width = prev.width; w.style.height = prev.height;
      delete w.dataset.maxed;
    } else {
      w.dataset.prev = JSON.stringify({ left: w.style.left, top: w.style.top, width: w.style.width, height: w.style.height });
      w.style.left = "0px"; w.style.top = "0px";
      w.style.width = "100%"; w.style.height = "calc(100% - 0px)";
      w.dataset.maxed = "1";
    }
    raise(w);
  }

  /* dragging */
  var drag = null;
  document.addEventListener("pointerdown", function (e) {
    var tb = e.target.closest("[data-drag]");
    if (!tb || e.target.closest(".tbtn")) return;
    var w = tb.closest(".window");
    if (w.dataset.maxed) return;
    var r = w.getBoundingClientRect();
    drag = { w: w, dx: e.clientX - r.left, dy: e.clientY - r.top };
    raise(w);
    e.preventDefault();
  });
  document.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var maxX = window.innerWidth - 40;
    var maxY = window.innerHeight - 40;
    var x = Math.min(Math.max(e.clientX - drag.dx, 1 - drag.w.offsetWidth + 40), maxX);
    var y = Math.min(Math.max(e.clientY - drag.dy, 0), maxY);
    drag.w.style.left = x + "px";
    drag.w.style.top = y + "px";
  });
  document.addEventListener("pointerup", function () { drag = null; });

  function setStart(open) {
    startmenu.classList.toggle("hidden", !open);
    startBtn.classList.toggle("open", open);
  }
  startBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    setStart(startmenu.classList.contains("hidden"));
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest("#startmenu") && !e.target.closest("#start-btn")) setStart(false);
  });
  startmenu.addEventListener("click", function (e) {
    var item = e.target.closest(".sm-item");
    if (!item) return;
    setStart(false);
    if (item.dataset.act === "photos") {
      if (explorer.dataset.closed || explorer.classList.contains("hidden")) openWin(explorer);
      else raise(explorer);
    } else if (item.dataset.act === "shutdown") {
      openWin(shutdownWin);
    }
  });

  $("#sd-cancel").addEventListener("click", function () { closeWin(shutdownWin); });
  $("#sd-ok").addEventListener("click", function () {
    closeWin(shutdownWin);
    $("#shutdown-screen").classList.remove("hidden");
  });
  $("#shutdown-screen").addEventListener("click", function () {
    $("#shutdown-screen").classList.add("hidden");
  });

  document.addEventListener("keydown", function (e) {
    if (!viewer.classList.contains("hidden")) {
      if (e.key === "ArrowLeft") btnPrev.click();
      else if (e.key === "ArrowRight") btnNext.click();
      else if (e.key === "Escape") closeWin(viewer);
    }
    if (e.key === "Escape") setStart(false);
    if (e.key === "Enter" && selIdx >= 0 && !explorer.classList.contains("hidden")) openViewer(selIdx);
  });

  function tick() {
    var d = new Date(), h = d.getHours(), ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    $("#clock").textContent = h + ":" + String(d.getMinutes()).padStart(2, "0") + " " + ap;
  }
  setInterval(tick, 1000);
  tick();

  renderFolder("all", false);
  raise(explorer);
})();