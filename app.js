var express = require("express");
var app = express();
var session = require("express-session");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var moment = require("moment");
var port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded());
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.set("view engine", "ejs");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "aoaoao99",
  database: "tiemchung",
  multipleStatements: true,
});

con.connect(function (err) {
  if (err) throw err;

  app.use(express.static("client"));

  app.post("/injection-registration", function (request, response) {
    con.query(
      "SELECT * FROM person WHERE person_cccd = ? AND person_phone = ?",
      [request.body.cccd, request.body.phone],
      function (err, result, fields) {
        if (err) throw err;
        if (result.length === 0) {
          response.render("tracuuloi");
        } else {
          var personDob = moment(result[0].person_dob).format("DD/MM/YYYY");
          var personDate = moment(result[0].person_date).format("DD/MM/YYYY");
          response.render("ketquadangky", {
            data: result,
            dob: personDob,
            date: personDate,
          });
        }
      }
    );
  });

  app.post("/register", function (request, response) {
    var inj_code;
    con.query(
      "SELECT inject_code FROM inject WHERE inject_check = 'false' LIMIT 1;",
      function (err, rows) {
        if (err) throw err;
        inj_code = rows[0].inject_code;
        var datetime = new Date();
        if (request.body.injection === "Mũi tiêm tiếp theo") {
          var injectDate;
          con.query(
            "SELECT inject_date FROM inject WHERE inject_code IN (SELECT person_inj_code FROM person WHERE person_cccd = ?);",
            [request.body.cccd],
            function (err, rows) {
              if (err) throw err;
              injectDate = rows[0].inject_date;
              con.query(
                "UPDATE person SET person_phone = ?, person_injection = ?, person_address = ?, person_province = ?, person_district = ?, person_subdistrict = ?, person_inj_code = ?, person_date = ? WHERE person_cccd = ?;",
                [
                  request.body.phone,
                  request.body.injection,
                  request.body.address,
                  request.body.province,
                  request.body.district,
                  request.body.subdistrict,
                  inj_code,
                  datetime,
                  request.body.cccd,
                ],
                function (err, rows) {
                  if (err) {
                    response.render("dangkythatbai");
                  } else {
                    con.query(
                      "UPDATE inject SET inject_check = 'true', inject_date = ?, person_injected = ? WHERE inject_check = 'false' LIMIT 1;",
                      [injectDate, request.body.cccd],
                      function (err, rows) {
                        if (err) throw err;
                      }
                    );
                    response.render("dangkythanhcong");
                  }
                }
              );
            }
          );
        } else {
          con.query(
            "INSERT INTO person VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              request.body.name,
              request.body.dob,
              request.body.gender,
              request.body.phone,
              request.body.cccd,
              request.body.injection,
              request.body.address,
              request.body.province,
              request.body.district,
              request.body.subdistrict,
              inj_code,
              datetime,
            ],
            function (err, rows) {
              if (err) {
                response.render("dangkythatbai");
              } else {
                con.query(
                  "UPDATE inject SET inject_check = 'true', person_injected = ? WHERE inject_check = 'false' LIMIT 1;",
                  [request.body.cccd],
                  function (err, rows) {
                    if (err) throw err;
                  }
                );
                response.render("dangkythanhcong");
              }
            }
          );
        }
      }
    );
  });

  app.post("/cancel-registration", function (request, response) {
    var personInjection;
    con.query(
      "SELECT person_injection FROM person WHERE person_cccd = ?;",
      [request.body.cccd],
      function (err, rows) {
        if (err) throw err;
        personInjection = rows[0].person_injection;
        if (personInjection === "Mũi tiêm thứ nhất") {
          con.query(
            "DELETE FROM person WHERE person_inj_code = ? AND person_name = ? AND person_phone = ? AND person_cccd = ?;",
            [
              request.body.injection_code,
              request.body.name,
              request.body.phone,
              request.body.cccd,
            ],
            function (err, result, fields) {
              if (err) throw err;
              if (result.affectedRows === 0) {
                response.render("huydangkythatbai");
              } else {
                con.query(
                  "UPDATE inject SET inject_check = 'false', person_injected = null WHERE inject_code = ?;",
                  [request.body.injection_code],
                  function (err, result, fields) {
                    if (err) throw err;
                    response.render("huydangky");
                  }
                );
              }
            }
          );
        } else if (personInjection === "Mũi tiêm tiếp theo") {
          var injectCode;
          con.query(
            "SELECT inject_code FROM inject WHERE person_injected = ? LIMIT 1;",
            [request.body.cccd],
            function (err, rows) {
              if (err) throw err;
              injectCode = rows[0].inject_code;
              con.query(
                "UPDATE person SET person_injection = 'Mũi tiêm thứ nhất', person_inj_code = ? WHERE person_inj_code = ? AND person_name = ? AND person_phone = ? AND person_cccd = ?;",
                [
                  injectCode,
                  request.body.injection_code,
                  request.body.name,
                  request.body.phone,
                  request.body.cccd,
                ],
                function (err, result, fields) {
                  if (err) throw err;
                  if (result.affectedRows === 0) {
                    response.render("huydangkythatbai");
                  } else {
                    con.query(
                      "UPDATE inject SET inject_check = 'false', inject_date = null, person_injected = null WHERE inject_code = ?;",
                      [request.body.injection_code],
                      function (err, result, fields) {
                        if (err) throw err;
                        response.render("huydangky");
                      }
                    );
                  }
                }
              );
            }
          );
        } else {
          response.render("huydangkythatbai");
        }
      }
    );
  });

  app.post("/injection-certificate", function (request, response) {
    con.query(
      "SELECT person.*, inject_date, inject_date2 FROM person JOIN inject ON person_inj_code = inject_code WHERE person_phone = ? AND person_name = ? AND person_dob = ? AND person_gender = ?;",
      [
        request.body.phone,
        request.body.name,
        request.body.dob,
        request.body.gender,
      ],
      function (err, result, fields) {
        if (err) throw err;
        if (result.length === 0) {
          response.render("chuadangky");
        } else {
          var personDob = moment(result[0].person_dob).format("DD/MM/YYYY");
          var chungnhan;
          if (result[0].inject_date === null) {
            chungnhan = "Đã tiêm 0 mũi vắc xin";
          } else if (
            result[0].inject_date !== null &&
            result[0].inject_date2 === null
          ) {
            chungnhan = "Đã tiêm 1 mũi vắc xin";
          } else {
            chungnhan = "Đã tiêm 2 mũi vắc xin";
          }
          response.render("chungnhan", {
            data: result,
            tiem: chungnhan,
            dob: personDob,
          });
        }
      }
    );
  });

  app.post("/auth", function (request, response) {
    var username = request.body.username;
    var password = request.body.password;
    con.query(
      "SELECT * FROM accounts WHERE username = ? AND password = ?",
      [username, password],
      function (error, results, fields) {
        if (results.length > 0) {
          request.session.loggedin = true;
          request.session.username = username;
          response.render("quanly");
        } else {
          response.render("dangnhapsai");
        }
      }
    );
  });

  app.get("/inject_date", function (request, response) {
    response.render("inject_date");
  });

  app.post("/inject_date", function (request, response) {
    var personInjection;
    con.query(
      "SELECT person_injection FROM person WHERE person_inj_code = ?;",
      [request.body.code],
      function (err, rows) {
        if (err) throw err;
        personInjection = rows[0].person_injection;
        if (personInjection === "Mũi tiêm thứ nhất") {
          con.query(
            "UPDATE inject SET inject_date = ? WHERE inject_code = ?",
            [request.body.date, request.body.code],
            function (err, result, fields) {
              if (err) throw err;
              if (result.length === 0) {
                response.render("nhapsai");
              } else {
                response.render("inject_date");
              }
            }
          );
        } else if (personInjection === "Mũi tiêm tiếp theo") {
          con.query(
            "UPDATE inject SET inject_date2 = ? WHERE inject_code = ?",
            [request.body.date, request.body.code],
            function (err, result, fields) {
              if (err) throw err;
              if (result.length === 0) {
                response.render("nhapsai");
              } else {
                response.render("inject_date");
              }
            }
          );
        } else {
          response.render("nhapsai");
        }
      }
    );
  });

  app.get("/add_manager", function (request, response) {
    response.render("add_manager");
  });

  app.post("/add_manager", function (request, response) {
    con.query(
      "INSERT INTO accounts (username, password, email) VALUES (?, ?, ?);",
      [request.body.username, request.body.password, request.body.email],
      function (err, rows) {
        if (err) {
          throw err;
        } else {
          response.render("add_manager_success");
        }
      }
    );
  });

  app.get("/inject_input", function (request, response) {
    response.render("inject_input");
  });

  app.post("/inject_input", function (request, response) {
    for (let i = 0; i < request.body.total; i++) {
      con.query(
        "INSERT INTO inject (date_added) VALUES (?);",
        [request.body.date],
        function (err, rows) {
          if (err) throw err;
          if (i === request.body.total - 1) {
            response.render("inject_input");
          }
        }
      );
    }
  });

  app.get("/statistical", function (request, response) {
    con.query(
      "SELECT MAX(inject_code) AS tongdangky FROM inject WHERE inject_check = 'true';",
      function (err, rows) {
        if (err) {
          throw err;
        } else {
          var tongluotdangky = rows[0].tongdangky;
          con.query(
            "SELECT COUNT(DISTINCT person_injected) AS muidau FROM inject WHERE inject_date IS NOT null;",
            function (err, rows) {
              if (err) {
                throw err;
              } else {
                mui1 = rows[0].muidau;
                con.query(
                  "SELECT COUNT(person_injected) as muihai FROM inject WHERE inject_date IS NOT null AND inject_date2 IS NOT null;",
                  function (err, rows) {
                    if (err) {
                      throw err;
                    } else {
                      mui2 = rows[0].muihai;
                      con.query(
                        "SELECT MAX(inject_code) total_inj FROM inject;",
                        function (err, rows) {
                          if (err) {
                            throw err;
                          } else {
                            response.render("statistical", {
                              total: tongluotdangky,
                              total1: mui1,
                              total2: mui2,
                              total_inject: rows[0].total_inj,
                            });
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      }
    );

    // response.render("statistical");
  });
});

app.listen(port, function () {
  var host = "localhost";
  console.log("Example app listening at http://%s:%s", host, port);
});
