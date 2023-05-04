<template>
  <div>
    <div class="grid grid-cols-6 gap-4">
      <div
        v-for="species in data"
        class="mb-8 show font-serif text-xs cursor-pointer"
        :id="species.assessmentId"
        @click="handleClick"
      >
        <div class="w-full h-28">
          <img
            class="object-contain h-full w-full"
            :src="species.imageUrl"
            alt=""
          />
        </div>
        <div class="w-max mt-2">
          {{ species.commonName ? species.commonName : species.scientificName }}
        </div>
        <div class="w-max mb-1">{{ species.redlistCategory }}</div>
        <div class="font-mono w-max text-[10px] leading-3">
          <div>Kingdom: {{ species.kingdomName }}</div>
          <div>Phylum:&nbsp; {{ species.phylumName }}</div>
          <div>Class: &nbsp; {{ species.className }}</div>
          <div>Order: &nbsp; {{ species.orderName }}</div>
          <div>Family:&nbsp; {{ species.familyName }}</div>
          <div>Genus: &nbsp; {{ species.genusName }}</div>
          <div>Species: {{ species.speciesName }}</div>
        </div>
      </div>
    </div>
    <div
      @click="hide()"
      class="w-full h-full fixed top-0 left-0 p-8 flex flex-col gap-4 items-center justify-center bg-white bg-opacity-40 backdrop-blur-sm"
      :class="{ visible: showWiki, invisible: !showWiki }"
    >
      <!-- <div class="bg-white p-2 border border-black text-xs w-[50vw] max-h-[75vh] overflow-scroll" v-html="info"></div> -->
      <iframe
        id="wiki"
        class="w-[75vw] h-[75vh] border border-black"
        :src="url"
      ></iframe>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      wikipediaPageId: "",
      url: "http://en.wikipedia.org/",
      showWiki: false,
      info: "",
      data: [],
    };
  },
  methods: {
    hide() {
      this.showWiki = false;
    },
    testSearch() {
      this.searchWikipedia("Salvelinus+struanensis");
    },
    async searchWikipedia(q) {
      this.wikipediaPageId = await useFetch(`/api/wiki/${q}`);
      const result = JSON.parse(JSON.stringify(this.wikipediaPageId));
      if (result.data) {
        const pageId = Object.keys(result.data.query.pages)[0];
        this.wikipediaPageId = pageId;
        this.url = `https://en.wikipedia.org/?curid=${pageId}`;
      }
    },
    async handleClick(event) {
      const divId = event.currentTarget.id;
      if (divId) {
        let species = this.data.find((elem) => elem.assessmentId == divId);
        this.info = species.assessment;
        const query = species.scientificName.replace(/\s+/g, "+");
        await this.searchWikipedia(query);
        setTimeout(() => {
          this.showWiki = true;
        }, 100);
      } else {
      }
    },
  },
  async mounted() {
    const q = "lamna+nasus";
    this.searchWikipedia(q);
    const { result } = await $fetch("/api/firestore/query?col=species1");
    // very hacky way of updating a link that doesn't work
    // should update firebase. should update the code that assigns the url, actually.
    result.find((elem) => elem.commonName == "Newbery's Rove Beetle").imageUrl =
      "https://inaturalist-open-data.s3.amazonaws.com/photos/24203916/medium.jpeg";
    this.data = result;
  },
};
</script>
