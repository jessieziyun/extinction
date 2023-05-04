export default defineEventHandler(async (event) => {
  var url = "https://en.wikipedia.org/w/api.php";
  const { query } = event.context.params;
  console.log(query);
  var reqURL =
    "https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrnamespace=0&exsentences=1&exintro&explaintext&exlimit=max&prop=extracts&gsrlimit=1&gsrsearch=" +
    query +
    "&format=json";

  const data = await $fetch(reqURL);
  // console.log(data);
  return data;
});
