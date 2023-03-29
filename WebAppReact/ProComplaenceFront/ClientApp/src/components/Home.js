import React, { Component } from 'react';
import {variables} from "../Variables";
import "bootstrap/js/src/modal"
import $ from "jquery";
import {NavLink} from "react-router-dom";


export class Home extends Component {
  static displayName = Home.name;
  fileUpload = (e) => {
    let reader = new FileReader();
    let file = e.target.files[0];
    reader.onloadend = () => {
      this.setState({
        UserFile: reader.result
      });
    }
    reader.readAsBinaryString(file);
  }

  constructor(props) {
    super(props);
    this.state = {
      FilesList: [],
      modalTitle: "Add file",
      FileName: "",
      FilePath: "",
      LastDate: null,
      FileId: 0,
      UserFile: null,
      FileNameFilter: "",
      FilesWithoutFilter: [],
      UserId: null,
      UserName: "",
    }
  }

  filterFiles() {
    let file_list = this.state.FilesWithoutFilter;
    if (this.state.FileNameFilter !== "") {
      file_list = file_list.filter(file => file.Filename.toLowerCase().includes(this.state.FileNameFilter.toLowerCase()));
    }
    this.setState({ FilesList: file_list });
  }

  refreshFiles() {
    if (this.state.UserId === null) {
      return;
    }
    fetch(variables.API_URL + '/api/fileupload/' + this.state.UserId)
        .then(response => response.json())
        .then(data => {this.state.FilesWithoutFilter = data;
          this.filterFiles();
        });

  }

  componentDidMount() {
    this.refreshFiles();
  }

  addClick = () => {
    this.setState({
      modalTitle: "Add File",
    });
  }

  sendMessage = (method, _id="") => {
    fetch(variables.API_URL + '/api/fileupload' + (_id.length?"/"+_id:_id), {
      method: method,
      headers: {
        'Accept': 'application/json',
      },
      body: JSON.stringify({
          id: _id
      })
      })
        .then(response => response.json())
  }
  
  deleteClick = (id) => {
    if(window.confirm("Are you sure you want to delete this file?")) {
      this.sendMessage("DELETE", id.toString());
    }
  }

  renderSortingBtn (prop, asc) {
    return (
        <button type="button" className="btn btn-light m-1"
                onClick={() => this.sortTable(prop, asc)}>
          {asc ?
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                   className="bi bi-arrow-down-square" viewBox="0 0 16 16">
                <path fillRule="evenodd"
                      d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm8.5 2.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
              </svg> :
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                   className="bi bi-arrow-up-square" viewBox="0 0 16 16">
                <path fillRule="evenodd"
                      d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm8.5 9.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"/>
              </svg>
          }

        </button>
    )

  }
  
  logInUser() {
    fetch(variables.API_URL + '/api/auth/' + this.state.UserName, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data["Status"] === "Ok") {
          this.setState({
            UserId: data["Id"],
          });
        }
      });
  }

  sortTable(prop, asc) {
    let sortedData = this.state.FilesList.sort((a, b) => {
      if (asc) {
        return a[prop] > b[prop] ? 1 : a[prop] < b[prop] ? -1 : 0;
      } else {
        return b[prop] > a[prop] ? 1 : b[prop] < a[prop] ? -1 : 0;
      }
    })
    this.setState({ FilesList: sortedData });

  };

  render() {
    const {FilesList, modalTitle, FileName, FilePath, LastDate, FileId, UserFile, UserId, UserName} = this.state;

    return (
        <div>
          {UserId !== null ? 
              <div>
            <button type="button" className="btn btn-light m-2 float-end"
            onClick={() => this.refreshFiles()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
            className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path
            d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
            </button>
            <button type="button" className="btn btn-primary m-2 float-end"
            data-bs-toggle="modal"
            data-bs-target="#FileModal"
            onClick={() => this.addClick()}>
            Add File
            </button>
            <table className="table table-striped">
            <thead>
            <tr>
            <th>
            <div className="d-flex flex-row">
            <input className="form-control my-2 me-2"
            onChange={(e) => {
            this.state.FileNameFilter = e.target.value;
            this.filterFiles();
          }}
            placeholder="Filter"/>
          {this.renderSortingBtn("Filename", true)}
          {this.renderSortingBtn("Filename", false)}
            </div>
            Name
            </th>
            <th>
            Date
            </th>
            <th className="text-end">
            Options
            </th>
            </tr>
            </thead>
            <tbody>
          {FilesList.map((file) => {
            return (
            <tr key={file.Id}>
            <td>
          {file.Filename}
            </td>
            <td>
          {file.LastDate}
            </td>

            <td>
            <button type="button" className="btn btn-light mx-1 float-end" onClick={() => this.deleteClick(file.Id)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
            <path
            d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
            </svg>
            </button>
            <NavLink to={`/overseer/${file.Id}`}>
            <button type="button" className="btn btn-light mx-1 float-end">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
            className="bi bi-eye" viewBox="0 0 16 16">
            <path
            d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
            <path
            d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
            </svg>
            </button>
            </NavLink>

            </td>

            </tr>
            );
          })}
            </tbody>
            </table>
            <div className="modal fade" id="FileModal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
            <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">{modalTitle}</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
            <form id="fileForm">
            <div className="input-group mb-3">
            <span className="input-group-text"> File</span>
            <input type="file" id="uploadFile" accept="text/csv" className="form-control"
            onChange={this.fileUpload}/>
            </div>
            <button type="button" className="btn btn-primary float-start" data-bs-dismiss="modal"
            onClick={function () {
            let formData = new FormData();
            let file = $('#uploadFile').prop('files')[0];
            formData.append('file', file);
            $.ajax({
            type: "POST",
            url: variables.API_URL + '/api/fileupload/' + UserId,
            contentType: false,
            processData: false,
            cache: false,
            data: formData
          })
            .fail(function (xhr, status, p3) {
            alert(xhr.responseText);
          });
          }}>Create
            </button>
            </form>
            </div>
            </div>
            </div>
            </div>
              </div>
          :
            <div className="container-fluid justify-content-center">
              <div className="row justify-content-center">
                <div className="row col-6 justify-content-center">
                  <input type="login" className="form-control" placeholder="Login" value={UserName} onChange={(e)=> {
                    this.setState({UserName: e.target.value})
                  }} ></input>
                  <button type="button" className="btn btn-secondary m-3" onClick={(e) => this.logInUser()}>Войти</button>
                </div>
              </div>
            </div>
          }
          
        </div>

    );
  }
}
