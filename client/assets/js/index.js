$(document).ready(function () {
  $("#submit-input button:first-child").click(function () {
    $(".form-group input").val("");
    $(".form-group select").prop("selectedIndex", 0);
  });

  if ($(".res500:first-child .form-group:first-child input").length) {
    $(".res500:first-child .form-group:first-child input").focus();
  } else {
    $(".res500:first-child .form-group:last-child input").focus();
  }

  $("form").on("keydown", function (e) {
    if (e.keyCode == 13) {
      return false;
    }
  });

  $("input").keyup(function (e) {
    var code = e.key;
    if (code === "Enter") {
      if ($(this).attr("id") === "kqdk-cccd") {
        $(this).parent().next().children("input").focus();
      }

      if ($(this).attr("id") === "kqdk-sdt") {
        // $(this).parent().parent().next().children('button').first().css('display', 'none');
      }

      if ($(this).attr("id") === "dkt-name") {
        $(this)
          .parent()
          .parent()
          .next()
          .children()
          .first()
          .children("input")
          .focus();
      }

      if ($(this).attr("id") === "dkt-dob") {
        $(this)
          .parent()
          .parent()
          .next()
          .children()
          .first()
          .children("input")
          .focus();
      }

      if ($(this).attr("id") === "dkt-sdt") {
        $(this).parent().next().children("input").focus();
      }

      if ($(this).attr("id") === "dkt-cccd") {
        $(this)
          .parent()
          .parent()
          .next()
          .children()
          .first()
          .children("input")
          .focus();
      }

      if ($(this).attr("id") === "cnt-cccd") {
        $(this).parent().next().children("input").focus();
      }

      if ($(this).attr("id") === "cnt-dob") {
        $(this).parent().parent().next().children().children("input").focus();
      }

      if ($(this).attr("id") === "hdk-name") {
        $(this).parent().next().children("input").focus();
      }

      if ($(this).attr("id") === "hdk-sdt") {
        $(this)
          .parent()
          .parent()
          .next()
          .children()
          .first()
          .children("input")
          .focus();
      }

      if ($(this).attr("id") === "hdk-cccd") {
        $(this).parent().next().children("input").focus();
      }
    }
  });
});
