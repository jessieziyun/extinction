<template>
  <div>
    <!-- <div class="font-mono mb-4">Total: {{ firebase.length }}</div> -->
    <div class="grid grid-cols-6 gap-4">
      <div
        v-for="species in firebase"
        class="mb-8 show font-serif text-xs"
        :id="species.assessmentId"
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
          <div>Species: {{ species.speciesName }}</div>
          <div>Kingdom: {{ species.kingdomName }}</div>
          <div>Phylum:&nbsp; {{ species.phylumName }}</div>
          <div>Class: &nbsp; {{ species.className }}</div>
          <div>Order: &nbsp; {{ species.orderName }}</div>
          <div>Family:&nbsp; {{ species.familyName }}</div>
          <div>Genus: &nbsp; {{ species.genusName }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
export default {
  data() {
    return {
      data: {
        summary: {},
        filteredSummary: [],
        assessments: {},
        commonNames: {},
      },
      info: {
        assessment: "",
        position: { x: "0px", y: "0px" },
        show: false,
      },
      firebase: {},
    };
  },
  methods: {
    async loadData() {
      // only load threatened species
      const filteredData = this.data.summary.filter(
        (species) =>
          species.redlistCategory !== "Least Concern" &&
          species.redlistCategory !== "Data Deficient"
      );

      for (let i = 266; i < filteredData.length; i++) {
        setTimeout(async () => {
          // search google images and get url of first result
          const query = filteredData[i].scientificName.replace(/\s+/g, "+");
          filteredData[i].imageSearch = await useFetch(`/api/img/${query}`);
          const result = JSON.parse(
            JSON.stringify(filteredData[i].imageSearch)
          );

          // hacky way of asking whether or not the search limit has been reached :)
          if (result.data.items[0].link) {
            filteredData[i].imageUrl = result.data.items[0].link;
            // note: manually updated the url for "Newbery's Rove Beetle" to the second
            // result as the first link was an "x-raw-image:///" instead of a website url.
            // would be good to find a way to detect if the link is useable if this needs
            // to be scaled or run frequently for any reason in future.

            // find common name from common_names.csv, add to object
            const commonName = this.data.commonNames.find(
              (elem) =>
                elem.scientificName == filteredData[i].scientificName &&
                elem.main == "true"
            );
            commonName
              ? (filteredData[i].commonName = commonName.name)
              : console.log("not found");

            // find assessment rationale from assessments.csv, add to object
            filteredData[i].assessment = this.data.assessments.find(
              (elem) => elem.assessmentId == filteredData[i].assessmentId
            ).rationale;

            // add species object to firestore
            this.addToFirestore("species1", this.data.filteredSummary[i]);
            console.log("added to firebase");
          }
        }, 100 * i);
      }
      this.data.filteredSummary = filteredData;
    },
    async addToFirestore(col, doc) {
      try {
        const { result } = await $fetch(`/api/firestore/add?col=${col}`, {
          method: "POST",
          body: doc,
        });

        return result;
      } catch (error) {
        console.log(error.message);
      }
    },
    sortData() {
      this.firebase.sort((a, b) => {
        // const groups = ['kingdomName', 'phylumName', 'className', 'orderName', 'familyName', 'genusName'];

        if (this.compare(a, b, "kingdomName") !== 0) {
          return this.compare(a, b, "kingdomName");
        }
        if (this.compare(a, b, "phylumName") !== 0) {
          return this.compare(a, b, "phylumName");
        }
        if (this.compare(a, b, "className") !== 0) {
          return this.compare(a, b, "className");
        }
        if (this.compare(a, b, "orderName") !== 0) {
          return this.compare(a, b, "orderName");
        }
        if (this.compare(a, b, "familyName") !== 0) {
          return this.compare(a, b, "familyName");
        }
        if (this.compare(a, b, "genusName") !== 0) {
          return this.compare(a, b, "genusName");
        }
        // else
        return 0;
      });
    },
    compare(a, b, property) {
      const propertyA = a[property].toUpperCase(); // ignore upper and lowercase
      const propertyB = b[property].toUpperCase(); // ignore upper and lowercase
      if (propertyA < propertyB) {
        return -1;
      }
      if (propertyA > propertyB) {
        return 1;
      }
      // names must be equal
      return 0;
    },
  },
  async mounted() {
    // upload data to firebase
    // this.data.summary = await d3.csv("/simple_summary.csv");
    // this.data.assessments = await d3.csv("/assessments.csv");
    // this.data.commonNames = await d3.csv("/common_names.csv");
    // this.loadData();

    const { result } = await $fetch("/api/firestore/query?col=species1");

    // very hacky way of updating a link that doesn't work
    // should update firebase. should update the code that assigns the url, actually.
    result.find((elem) => elem.commonName == "Newbery's Rove Beetle").imageUrl =
      "https://inaturalist-open-data.s3.amazonaws.com/photos/24203916/medium.jpeg";
    
    this.firebase = result;
    this.sortData();
  },
};
</script>
