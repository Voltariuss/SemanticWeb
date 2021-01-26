$(document).ready(() => {

  getCountries();

  $('.autocomplete').autocomplete({
    source: (value, response) => getAutoCompletion($(':focus'), value.term, response)
  });

});