import React, { useEffect, useState } from "react";
import { Button, Form, Col, Row } from "react-bootstrap";
import {
  Card,
  CardBody,
  CardHeader,
  CardHeaderToolbar,
} from "../../../../_metronic/_partials/controls";

import { InvoiceManualTable } from "./InvoiceManualTable";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  resetData,
  selectLoading,
  selectPageNo,
  selectPageSize,
  selectTotalRecord,
  fetchInvoiceManual,
  selectInvoiceManual,
} from "./invoiceManualSlice";
import { LayoutSplashScreen } from "../../../../_metronic/layout";
import { showErrorDialog } from "../../../utility";
import { selectUser } from "../../../modules/Auth/_redux/authRedux";
import LoadingFetchData from "../../../utility/LoadingFetchData";
import {
  fetchBispar,
  selectBispar,
} from "../../administration/bussiness-parameter/parameter/parameterSlice";
import Select from "react-select";

export const InvoiceManualPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const data = useSelector(selectInvoiceManual);
  const user = useSelector(selectUser);
  const loading = useSelector(selectLoading);
  const pageNo = useSelector(selectPageNo);
  const pageSize = useSelector(selectPageSize);
  const totalRecord = useSelector(selectTotalRecord);
  const [overlayLoading, setOverlayLoading] = useState(false);
  const dataBispar = useSelector(selectBispar);
  const [value, setValue] = useState(""); //u/ deklarasi state

  // Filter
  //const [type, setType] = useState("");
  const [vendorCode, setVendorCode] = useState("");
  const [refDocNo, setRefDocNo] = useState("");
  const [allocNmbr, setAllocNmbr] = useState("");
  const [dapartement, setDapartement] = useState("");
  const [belnr, setBelnr] = useState("");
  const filterVendorCode =
    user.vendor_code === null ? vendorCode : user.vendor_code;

  useEffect(() => {
    // Reset on first load
    dispatch(resetData());

    dispatch(
      fetchBispar({
        paramgroup_code: "INVOICE_DEPARTMENT",
        pageNo: 1,
        pageSize: -1,
      })
    );
  }, [dispatch]);

  const handleSearch = async () => { //pemanggilan fungsi handle search
    const params = {
      vendor_code: filterVendorCode,
      ref_doc_no: refDocNo,
      belnr: belnr,
      alloc_nmbr: allocNmbr,
      department: dapartement,
      with_po: "N",
      purch_org: value, //parameter pembacaan u/ melakukan permintaan API
      pageNo: 1,
      pageSize: 10,
    };
    console.log("test value : " + params.value);
    try {
      const response = await dispatch(fetchInvoiceManual(params));
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
        value = action.payload.value; // Corrected the syntax here
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
        vendor_code: filterVendorCode,
        ref_doc_no: refDocNo,
        alloc_nmbr: allocNmbr,
        department: dapartement,
        belnr: belnr,
        with_po: "N",
        purch_org: user.purch_org,
        pageNo: page,
        pageSize: sizePerPage,
      };
      try {
        const response = await dispatch(fetchInvoiceManual(params));
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
      setDapartement("");
    } else {
      setDapartement(e.value);
    }
  };

  return loading ? (
    <LayoutSplashScreen />
  ) : (
    <Card>
      <CardHeader title="Invoice Non PO">
        {user.vendor_code !== null && (
          <CardHeaderToolbar>
            <Button
              className="btn btn-danger"
              onClick={() =>
                history.push("/transaction/invoice-without-po/create")
              }
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
                    <b>Vendor</b>
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
              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  <b>Invoice No</b>
                </Form.Label>
                <Col sm={6}>
                  <Form.Control
                    type="text"
                    placeholder="Invoice No"
                    onChange={(e) => {
                      setRefDocNo(e.target.value);
                    }}
                    value={refDocNo}
                    onKeyPress={handleKeyPress}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  <b>JV Number</b>
                </Form.Label>
                <Col sm={6}>
                  <Form.Control
                    type="text"
                    onChange={(e) => {
                      setBelnr(e.target.value);
                    }}
                    value={belnr}
                    onKeyPress={handleKeyPress}
                  />
                </Col>
              </Form.Group>
            </Col>

            {/* Right Row */}

            <Col sm={6}>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  <b>No Faktur Pajak</b>
                </Form.Label>
                <Col sm={6}>
                  <Form.Control
                    type="text"
                    placeholder="No Faktur Pajak"
                    onChange={(e) => {
                      setAllocNmbr(e.target.value);
                    }}
                    value={allocNmbr}
                    onKeyPress={handleKeyPress}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  <b>Department</b>
                </Form.Label>
                <Col sm={6}>
                  <Select
                    isClearable={true}
                    options={typeOptions}
                    value={getValueType(dapartement, typeOptions)}
                    // placeholder="Select TYpe"
                    onChange={handleTypeChange}
                  />
                </Col>
              </Form.Group>
              
              <Form.Group as={Row}>
                <Col sm={6}>
                  {user.purch_org !== null && (
                    <Form.Group as={Row} className="mt-3">
                      <Form.Label column sm={6}>
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
                    <Form.Group as={Row} className="mt-3">
                      <Form.Label column sm={6}>
                        <b>Purchasing Organization</b>
                      </Form.Label>
                      <Col sm={6}>
                        <Form.Control
                          type="text"
                          placeholder="Purchasing Organization"
                          onChange={(e) => {
                            setValue(e.target.value); //** */
                          }}
                          value={value} //** */
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
            </Col>

              
                {/* <Col sm={3}>
                  <Button
                    className="btn btn-danger"
                    onClick={() => history.push("/masterdata/vendor-create")}
                  >
                    Create
                  </Button>
                </Col> */}
          </Form.Group>
        </Form>

        {/* Table */}
        {data && data.length > 0 && (
          <InvoiceManualTable
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
