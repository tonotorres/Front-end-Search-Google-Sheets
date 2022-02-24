<template>
<!-- eslint-disable -->
  <div class="results">
    <div class="table-data">

      <div>
        
        
        <b-button v-if="filteredData.length !== 0" @click="csvExport()" class="download-button " variant="outline-primary"><i class="fas fa-download"></i> Download CSV</b-button>
        <b-input class="filter-input" type="text" :placeholder="placeholderMessage" v-model="filter" />
        <!-- <h6 class="title-results">Date of the last CSV data update: 31/01/2022 1:49:23</h6> -->
        
      </div>
      
      <table striped class="table-results">
        <template v-for="table in filteredTables.slice(pageNumber, numberOfElements)"> <!-- schema.table_options -->
          <tr @click="toggle(table)" class="table-name" :class="{ opened: opened.includes(table.table) }">
            <td>
              <div class=" left">
                <b>{{table.schema}}</b> // </b> <p v-html="highlightMatches(table.table)">{{table.table}}</p>
              </div>
              <span v-if="!(filteredData.length === 0)" class="right">Number of fields: {{table.fields.length}}</span>
            </td>
          </tr>
          <tr v-if="opened.includes(table.table)" v-for="field in table.fields">
            <td v-b-modal.modal-xl class="field">
              <span class="left fields">{{field.field}}</span>
              <b class="left fields" v-if="field.project">({{field.project}})</b>
              <span v-if="strParser(field.value)[0] == 'All'" class="right">Number of queries: All</span>
              <span v-else class="right"><b>Number of queries: {{strParser(field.value).length}}     </b> <span>( </span><span class="queries" v-for="querie in strParser(field.value)"> {{querie}}</span><span> )</span></span>
            </td>
          </tr>
        </template>
      </table>
    </div>
    <div class="next-page-inputs">
      <b-button   v-on:click="previousPage()" variant="outline-primary"><i class="next-page-button fas fa-angle-left "></i></b-button>
      <span style="padding-left: 20px; padding-right: 20px">Page {{(pageNumber/10) + 1}} of {{maxPages}}</span>
      <b-button  v-on:click="nextPage()" variant="outline-primary"><i class="next-page-button fas fa-angle-right"></i></b-button>
    </div>
  </div>
  
</template>

<script>
import axios from 'axios'
import Multiselect from 'vue-multiselect'
import { BModal, VBModal } from 'bootstrap-vue'

export default {
  name: 'SchemaSelected',
  watch: {
    reloaded: function (val){
      this.opened = []
    },
    filteredData: {
      handler(n, o) {
        this.opened = []
      },
      deep: true
    },
    TablesBySchemas: {
      handler(n, o) {
        this.opened = []
      },
      deep: true
    },
    filteredTables: function (val) {
      this.opened = []
      this.pageNumber = 0
    }
  },
  updated() {
  },
  beforeMount(){
    
  },
  mounted() {
  },
  components: {
    Multiselect,
    BModal
  },
  directives: { 'b-modal': VBModal },
  props: {
    TablesBySchemas: Array,
    filteredData: Array,
    reloaded: Number,
    queryAnalizar: Array
  },
  data() {
    return {
      filter: "",
      modalShow: false,
      opened: [],
      tables_displayed: [],
      pageNumber: 0,
    }
  },
  methods: {
    strParser(curr_str){

      let curr_list = curr_str.split("@");
      if (curr_list[0].includes("*")){
          curr_list=["All"];
      }
      else{
          curr_list = curr_list.splice(1)
      }
      return curr_list;
    },
    showModal(table, field) { 
      this.modalShow = !this.modalShow
    },
    csvExport() {
       let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "SCHEMA" + ";" + "PROJECT" + ";" + "TABLE" + ";" + "FIELD"+ ";" + "QUERY" +"\r\n";

      this.filteredTables.forEach(function(rowArray) {
          let esquema = rowArray.schema;
          let tabla = rowArray.table;

          rowArray.fields.forEach(curr_tabla => {
              let proyecto = curr_tabla.project;
              let campo = curr_tabla.field;
              let query = curr_tabla.value;
              csvContent += esquema + ";" + proyecto + ";" + tabla + ";" + campo+ ";" + query +"\r\n";
          });
      });
    
      const data = encodeURI(csvContent);
      const link = document.createElement("a");
      
      link.setAttribute("href", data);
      link.setAttribute("download", "export.csv");
      link.click();
    },
    nextPage(){
      if(this.filteredTables.length > this.pageNumber + 10) this.pageNumber = this.pageNumber + 10
    },
    previousPage(){
      if(this.pageNumber - 10 >= 0) this.pageNumber = this.pageNumber - 10
    },
    highlightMatches(text) {
      const matchExists = text
        .toLowerCase()
        .includes(this.filter.toLowerCase());
      if (!matchExists) return text;

      const re = new RegExp(this.filter, "ig");
      return text.replace(re, matchedText => `<strong>${matchedText}</strong>`);
    },
    toggle(id) {
      if(this.filteredData.length !== 0 ) {
        const index = this.opened.indexOf(id.table);
        if (index > -1) {
          this.opened.splice(index, 1)
        } else {
          this.opened.push(id.table)
        }
      }
    },
  },
  computed: {
    modalContent(){
      
      return this.queryAnalizar
    },
    placeholderMessage(){
      return "Filter by table or schema in " + this.filteredTables.length + " tables"
    },
    maxPages() {
      return Math.ceil(this.filteredTables.length / 10)
    },
    numberOfElements(){
      if((this.filteredTables.length - this.pageNumber) < 10) return this.filteredTables.length
      else return this.pageNumber + 10
    },
    filteredTables() {
      if(this.filteredData.length == 0){
        return this.TablesBySchemas.filter(table_option => {
          let searchTerm = this.filter.toLowerCase();
          const table = table_option.table.toLowerCase();
          const schema = table_option.schema.toLowerCase()
          return (
            table.includes(searchTerm) || schema.includes(searchTerm)
          );
        });
      }else {
        return this.filteredData.filter(table_option => {
          let searchTerm = this.filter.toLowerCase();
          const table = table_option.table.toLowerCase();
          const schema = table_option.schema.toLowerCase()
          return (
            table.includes(searchTerm) || schema.includes(searchTerm)
          );
        });
      }
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.queries {
  font-size: 80%;
}
.fields{
  padding-left: 40px !important;
}

table {
  width: 85%;
  border: 1px solid #ccc;
  
}
tr:hover {
  cursor: pointer;
}
tr {
  vertical-align: middle;
  border: 1px solid rgb(122, 122, 122) !important;
}
td {
  border: 1px solid #ccc;
}
td .left {
    padding-left: 20px;
    float: left;
}
td .right {
    float: right;
    padding-right: 20px;
}
.field {
  background-color: rgb(238, 238, 238) !important;
}
.field:hover {
  background-color: rgb(218, 218, 218) !important;
}
.opened td{
  background-color: rgb(39, 204, 110) !important;
  z-index: 999;
}
.results{
  text-align: center;

}
.table-data{
  width: 100%;
  padding: 0;
  margin-right:10%;
  text-align: center;
}
.table-results{
  width: 100%;
  border-radius: 25px;
}
.title-results {
  margin-left: 10px;
  margin-bottom: 10px;
  margin-top: 30px;
  float:left;
}
.next-page-inputs{
  padding-left: 30px;
  margin-bottom: 10px;
  margin-top: 20px;
  text-align: center;
}
.filter-input{
  float: left;
  width: 30% !important;
  margin-bottom: 10px;
  margin-top: 20px;
}
.download-button{
  margin-bottom: 10px;
  margin-top: 20px;
  float: right;
}
.next-page-button{
  margin-right: 10px;
  margin-left: 10px;
}
.left b{
  display: inline-block;
}
.left p{
  display: inline-block;
}
@media only screen and (max-width: 600px) {
  body {
    width: 100%;
  }
  .filter-input{
    width: 150px !important;
  }
  .title-results{
    font-size: 10%;
    margin-top:15px !important;
  }
  .results{
    margin: 0px;
  }
  .table-results{
    font-size: 30%;
  }
}
</style>
