<template>
<!-- eslint-disable -->
  <div class="results">
    <b-modal size="xl" id="modal-queries" modal-class="my-second-class" title="ROCHE_SFDC" v-bind:hideHeaderClose="true" v-bind:ok-only="true">
    <ul v-for="querie in queries_to_show">
      <li> <span> <b> Query number: </b> {{querie.n_query}} </span> </li>
      <li class="queries-show"><span> <b>URL: </b> <a v-bind:href="querie.url_query">{{querie.url_query}} </a></span></li>
    </ul>
    </b-modal>
    <div class="table-data">

      <div>
        
        
        <b-button @click="csvExport()" class="download-button " variant="outline-primary"><i class="fas fa-download"></i> Download CSV</b-button>
        <b-input class="filter-input" type="text" :placeholder="placeholderMessage" v-model="filter" />
        <!-- <h6 class="title-results">Date of the last CSV data update: 31/01/2022 1:49:23</h6> -->
        
      </div>
      
      <table striped class="table-results">
        <template v-for="project in filteredTables.slice(pageNumber, numberOfElements)"> <!-- schema.table_options -->
          <tr @click="toggle(project.tables.table, project.schema)" :class="{ opened: opened.includes(project.schema+project.tables.table) }">
            <td>
              <div class=" left">
                <b>{{ project.schema }}</b> // <b>{{ project.project }}</b> // <p>{{project.tables.table}}</p>
              </div>
              <span class="right">Number of fields: {{project.tables.values.length}}</span>
            </td>
          </tr>
          <tr v-if="opened.includes(project.schema+project.tables.table)" v-for="field in project.tables.values">
            <td v-b-modal.modal-xl class="field" @click="showQueries(project.schema, project.project, field.value)">
              <span class="left fields">{{field.field}}</span>
              <span v-if="strParser(field.value)[0] == 'All'" class="right">Number of queries: All</span>
              <span v-else class="right"><b>Number of queries: {{strParser(field.value).length}} </b> <span>( </span><span class="queries" v-for="querie in strParser(field.value)"> {{querie}}</span><span> )</span></span>
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
import Multiselect from 'vue-multiselect'
import { BModal, VBModal } from 'bootstrap-vue'

export default {
  name: 'AplicationSelected',
  watch: {
    schemas: function(val) {
      this.tables_displayed = []
      val.forEach(project =>{
        project.schemas.tables.forEach(table =>{
        this.tables_displayed.push({project: project.project, schema: project.schemas.schema, tables: table})
      })
      })
    },
    filteredTables: function (val) {
      this.pageNumber = 0
    },
  },
  updated() {
  },
  beforeMount(){
    
  },
  mounted() {
    this.schemas.forEach(project =>{
      project.schemas.tables.forEach(table =>{
        this.tables_displayed.push({project: project.project, schema: project.schemas.schema, tables: table})
      })
    })
    
  },
  components: {
    Multiselect,
    BModal
  },
  directives: { 'b-modal': VBModal },
  props: {
    schemas: Array,
    queryAnalizar: Array
  },
  data() {
    return {
      filter: "",
      modalShow: false,
      opened: [],
      queries_to_show: [],
      tables_displayed: [],
      pageNumber: 0,
    }
  },
  methods: {
    showQueries(schema, project, queries){
      this.queries_to_show = []
      this.queryAnalizar.forEach(querie => {
        if(querie.schema == schema)
          if(querie.project == project) {
            querie.queries.forEach(get_query => 
              this.strParser(queries).forEach(the_querie => {
                if(get_query.n_query.includes(the_querie)){this.queries_to_show.push(get_query)}
              })
          )}
      })
    this.$bvModal.show('modal-queries')
    },
    showModal(table, field) {
      this.modalShow = !this.modalShow
    },
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
    csvExport() {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "SCHEMA" + ";" + "PROJECT" + ";" + "TABLE" + ";" + "FIELD"+ ";" + "QUERY" +"\r\n";

      this.filteredTables.forEach(function(rowArray) {
          let esquema = rowArray.schema;
          let proyecto = rowArray.project;
          let tabla = rowArray.tables;

          let tabla_name = tabla.table;
          tabla.values.forEach(curr_tabla => {

              let campo = curr_tabla.field;
              let query = curr_tabla.value;
              csvContent += esquema + ";" + proyecto + ";" + tabla_name + ";" + campo+ ";" + query +"\r\n";
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
    toggle(table, schema) {
    	const index = this.opened.indexOf(schema+table);
      if (index > -1) {
      	this.opened.splice(index, 1)
      } else {
      	this.opened.push(schema+table)
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
      return this.tables_displayed.filter(table_option => {
        let searchTerm = this.filter.toLowerCase();
        const project = table_option.project.toLowerCase();
        const schema = table_option.schema.toLowerCase();
        const table = table_option.tables.table.toLowerCase();
        
        return (
          project.includes(searchTerm) || schema.includes(searchTerm) || table.includes(searchTerm));
      
    })
  }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style>
#modal-queries___BV_modal_backdrop_ {
    background-color: rgb(0,0,0,0.4) !important;
}
.queries-show{
  padding-left: 30px;
  list-style-type: none;
}
</style>