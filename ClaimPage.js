import React, { useEffect, useState } from "react";
import { Button, Form, Col, Row } from "react-bootstrap";
import {
  Card,
  CardBody,
  CardHeader,
  CardHeaderToolbar,
} from "../../../../_metronic/_partials/controls";

import { ClaimTable } from "./ClaimTable";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  resetData,
  selectClaim,
  selectLoading,
  selectPageNo,
  selectPageSize,
  selectTotalRecord,
  fetchClaim,
} from "./claimSlice";
import { LayoutSplashScreen } from "../../../../_metronic/layout";
import { showErrorDialog } from "../../../utility";
import { selectUser } from "../../../modules/Auth/_redux/authRedux";
import {
  fetchBispar,
  selectBispar,
} from "../../administration/bussiness-parameter/parameter/parameterSlice";
import Select from "react-select";
import LoadingFetchData from "../../../utility/LoadingFetchData";

export const ClaimPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const data = useSelector(selectClaim);
  const dataBispar = useSelector(selectBispar);
  const user = useSelector(selectUser);
  const loading = useSelector(selectLoading);
  const pageNo = useSelector(selectPageNo);
  const pageSize = useSelector(selectPageSize);
  const [overlayLoading, setOverlayLoading] = useState(false);
  const totalRecord = useSelector(selectTotalRecord);
  const [valueNmbr, setValueNmbr] = useState(""); //buat deklarasi state

  // Filter
  const [vendorCode, setVendorCode] = useState("");
  const [type, setType] = useState("");

  const filterVendorCode =
    user.vendor_code === null ? vendorCode : user.vendor_code;
  const filterPurOrg =
    user.purch_org === null ? valueNmbr : user.purch_org;

  useEffect(() => {
    // Reset on first load
    dispatch(resetData());

    dispatch(
      fetchBispar({
        paramgroup_code: "claim_type",
        pageNo: 1,
        pageSize: -1,
      })
    );
  }, [dispatch]);

  const handleSearch = async () => { //pemanggilan fungsi handle search
    const params = {
      LFNR1: filterVendorCode,
      pageNo: 1,
      pageSize: 10,
      purch_org: filterPurOrg, //valueNmbr, //parameter pembacaan u/ melakukan permintaan API
    };
    console.log("test value : " + params.value);
    try {
      const response = await dispatch(fetchClaim(params));
      if (response.payload.data.status === 200) {
        setOverlayLoading(false);
      } else if (
        response.payload.data.error === "10008" ||
        response.payload.data.error === "10009"
      ) {
        // Corrected the syntax here
        const action = await showErrorDialog(response.payload.data.message);
        if (action.isConfirmed) await history.push("/logout");
      } else {
        // Corrected the syntax here
        const action = await showErrorDialog(response.payload.data.message);
        if (action.isConfirmed) await history.push("/logout");
        valueNmbr = action.payload.value; // Corrected the syntax here
        setOverlayLoading(false);
      }
    } catch (error) {
      showErrorDialog(error.message);
      setOverlayLoading(false);
    }
  };  

  // API Service
  const fetchInvoiceFromAPI = async (params) => {
    const response = await fetch.post('/api/invoices', params);
    return response.data;
  };

  const handleTableChange = async (
    type,
    { page, sizePerPage, sortField, sortOrder, data }
  ) => {
    if (type === "pagination") {
      const params = {
        pageNo: page,
        pageSize: sizePerPage,
        purch_org: filterPurOrg, //valueNmbr,
      };
      try {
        const response = await dispatch(fetchClaim(params));
        if (response.payload.data.status === 200) {
          setOverlayLoading(false);
        } else if (
          response.payload.data.error === "10008" ||
          response.payload.data.error === "10009"
        ) {
          const action = await showErrorDialog(response.payload.data.message);
          if (action.isConfirmed) await history.push("/logout");
        } else {
          showErrorDialog(response.payload.data.message);
          setOverlayLoading(false);
        }
      } catch (error) {
        showErrorDialog(error.message);
        setOverlayLoading(false);
      }
    } else {
      let result;
      if (sortOrder === "asc") {
        result = data.sort((a, b) => {
          if (a[sortField] > b[sortField]) {
            return 1;
          } else if (b[sortField] > a[sortField]) {
            return -1;
          }
          return 0;
        });
        console.log(result, "asc");
      } else {
        result = data.sort((a, b) => {
          if (a[sortField] > b[sortField]) {
            return -1;
          } else if (b[sortField] > a[sortField]) {
            return 1;
          }
          return 0;
        });
        console.log(result, "desc");
      }
    }
  };

  const handleKeyPress = (event) => { //pencarian saat menekan tombol enter
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const typeOptions = dataBispar.map((e) => {
    return {
      value: e.param_code,
      label: e.param_value,
    };
  });

  const getValueType = (value, options) => {
    const return_value = options.filter((val) => value === val.value);
    return return_value;
  };

  const handleTypeChange = (e) => {
    if (e === null) {
      e = undefined;
      setType("");
    } else {
      setType(e.value);
    }
  };

  return loading ? (
    <LayoutSplashScreen />
  ) : (
    <Card>
      <CardHeader title="Claim">
        {user.vendor_code === null && (
          <CardHeaderToolbar>
            <Button
              className="btn btn-danger"
              onClick={() => history.push("/transaction/claim/create")}
            >
              Create
            </Button>
          </CardHeaderToolbar>
        )}
      </CardHeader>
      <LoadingFetchData active={overlayLoading} />
      <CardBody>
        {/* Filter */}
        <Form className="mb-5">
          <Form.Group as={Row}>
            <Col sm={6}>
              {user.vendor_code !== null && (
                <Form.Group as={Row}>
                  <Form.Label column sm={3}>
                    <b>Vendor</b>
                  </Form.Label>
                  <Col sm={6}>
                    <Form.Control
                      type="text"
                      placeholder="Vendor"
                      value={user.vendor_name}
                      disabled
                    />
                  </Col>
                </Form.Group>
              )}
              {user.vendor_code === null && (
                <Form.Group as={Row}>
                  <Form.Label column sm={3}>
                    <b>Vendor </b>
                  </Form.Label>
                  <Col sm={6}>
                    <Form.Control
                      type="text"
                      placeholder="Vendor"
                      onChange={(e) => {
                        setVendorCode(e.target.value);
                      }}
                      value={vendorCode}
                      onKeyPress={handleKeyPress}
                    />
                  </Col>
                </Form.Group>
              )}
            </Col>

            {/* Right Row */}
            <Col sm={6}>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  <b>Type</b>
                </Form.Label>
                <Col sm={5}>
                  <Select
                    isClearable={true}
                    options={typeOptions}
                    value={getValueType(type, typeOptions)}
                    placeholder="Select TYpe"
                    onChange={handleTypeChange}
                  />
                </Col>
              </Form.Group>
              {user.purch_org !== null && (
                <Form.Group as={Row} className="mt-5">
                  <Form.Label column sm={3}>
                    <b>Purchasing Organization</b>
                  </Form.Label>
                    <Col sm={6}>
                      <Form.Control
                        type="text"
                        placeholder="Purchasing Organization"
                        value={user.purch_org}
                        disabled
                      />
                    </Col>
                </Form.Group>
              )}
              {user.purch_org === null && (
                <Form.Group as={Row} className="mt-5">
                  <Form.Label column sm={3}>
                    <b>Purchasing Organization</b>
                  </Form.Label>
                    <Col sm={6}>
                      <Form.Control
                        type="text"
                        placeholder="Purchasing Organization"
                        onChange={(e) => {
                          setValueNmbr(e.target.value); 
                        }}
                        value={valueNmbr}
                        onKeyPress={handleKeyPress}
                      />
                    </Col>
                  </Form.Group>
              )}
                  <Button className="btn btn-danger" onClick={handleSearch}>
                      Search
                  </Button>
            </Col> 

          </Form.Group>
       </Form>   
  
        {/* Table */}
        {data && data.length > 0 && (
          <ClaimTable
            data={data}
            page={pageNo}
            sizePerPage={pageSize}
            totalSize={totalRecord}
            onTableChange={handleTableChange}
            loading={loading}
          />
        )}
        
      </CardBody>
    </Card>
  );
};
