export default defineEventHandler(async (event) => {
  const { query } = event.context.params;
  const { apiKey, searchEngineId } = useRuntimeConfig();

  // const uri = `https://api.currencyapi.com/v3/latest?currencies=${code}&apikey=${currencyKey}`
  const uri = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&searchType=image&cx=${searchEngineId}&q=${query}`;

  // console.log(uri);
  const data = await $fetch(uri);
  // console.log(data);
  return data;
});
