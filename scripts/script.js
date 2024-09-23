"use strict"
const response = await fetch("https://restcountries.com/v3.1/all");

const pays = await response.json();
let html = "";
html += "<tr>"
html += "<th>Name common</th>"
html += "<th>Image</th>"
html += "</tr>"
pays.forEach(pays => {
    html += "<tr>";
    html += `<td> ${pays.name.common} </td>`;
    html += `<td><img src="${pays.flags.png}" alt=""></td>`;
    html += "</tr>";
});
document.getElementById("tableau").innerHTML = html
console.log(pays)
