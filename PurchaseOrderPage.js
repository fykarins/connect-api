import React, { useEffect, useState } from "react";
import { env } from "../../../env";
import { Button, Form, Col, Row } from "react-bootstrap";
import {
  Card,
  CardBody,
  CardHeader,
} from "../../../_metronic/_partials/controls";
import { PurchaseOrderTable } from "./PurchaseOrderTable";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  resetData,
  selectPurchaseOrder,
  selectLoading,
  selectPageNo,
  selectPageSize,
  selectTotalRecord,
  fetchPurchaseOrder,
} from "./purchaseOrderSlice";
import { LayoutSplashScreen } from "../../../_metronic/layout";
import { showErrorDialog } from "../../utility";
import { selectUser } from "../../modules/Auth/_redux/authRedux";
import LoadingFetchData from "../../utility/LoadingFetchData";

export const PurchaseOrderPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const data = useSelector(selectPurchaseOrder);
  const user = useSelector(selectUser);
  const loading = useSelector(selectLoading);
  const pageNo = useSelector(selectPageNo);
  const pageSize = useSelector(selectPageSize);
  const totalRecord = useSelector(selectTotalRecord);
  const [overlayLoading, setOverlayLoading] = useState(false);

  // Filter
  const [po, setPo] = useState("");
  const [materialDesc, setMaterialDesc] = useState("");
  const [vendorCode, setVendorCode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [value, setValue] = useState(""); //u/ deklarasi state

  const filterVendorCode =
    user.vendor_code === null ? vendorCode : user.vendor_code;

  useEffect(() => {
    // Reset on first load
    dispatch(resetData());
  }, [dispatch]);

  const handleSearch = async () => { //pemanggilan fungsi handle search
    const params = {
      LIFNR: filterVendorCode,
      EBELN: po,
      material_description: materialDesc,
      ERDAT_START: startDate,
      ERDAT_END: endDate,
      confirm_to_vendor: "A",
      purch_org: value, //parameter pembacaan u/ melakukan permintaan API
      pageNo: 1,
      pageSize: 10,
    };

    //--Validasi--//
    if (startDate && endDate === "") {
      return showErrorDialog("Please Select End Date ");
    }
    if (endDate && startDate === "") {
      return showErrorDialog("Please Select Start Date");
    }
    //-- --//
    console.log("test value : " + params.value);
    try {
      const response = await dispatch(fetchPurchaseOrder(params));
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
        LIFNR: filterVendorCode,
        EBELN: po,
        material_description: materialDesc,
        ERDAT_START: startDate,
        ERDAT_END: endDate,
        confirm_to_vendor: "A",
        pageNo: page,
        pageSize: sizePerPage,
      };
      try {
        const response = await dispatch(fetchPurchaseOrder(params));
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

  const handleDownload = () => {
    let URL =
      `${env.REACT_APP_API_URL}/api/purchaseOrder/exportToExcel` +
      `?ERDAT_START=${startDate}` +
      `?ERDAT_END=${endDate}` +
      `?LIFNR=${filterVendorCode}` +
      `?purch_org=${user.purch_org}` +
      `?material_description=${materialDesc}` +
      `&EBELN=${po}`;
    window.open(URL);
  };


  return loading ? (
    <LayoutSplashScreen />
  ) : (
    <Card>
      <CardHeader title="Purchase Order"></CardHeader>
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
              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  <b>No Po</b>
                </Form.Label>
                <Col sm={6}>
                  <Form.Control
                    type="text"
                    placeholder="No Po"
                    onChange={(e) => setPo(e.target.value)}
                    value={po}
                    onKeyPress={handleKeyPress}
                  />
                </Col>
              </Form.Group>
            </Col>

            {/* Right Row */}
            <Col sm={6}>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  <b>Created Date</b>
                </Form.Label>
                <Col sm={4}>
                  <Form.Control
                    type="date"
                    placeholder="Valid From"
                    sm={6}
                    onChange={(e) => setStartDate(e.target.value)}
                    value={startDate}
                    onKeyPress={handleKeyPress}
                  />
                </Col>
                <b className="mt-3">To</b>
                <Col sm={4}>
                  <Form.Control
                    type="date"
                    placeholder="Valid To"
                    sm={6}
                    onChange={(e) => setEndDate(e.target.value)}
                    value={endDate}
                    onKeyPress={handleKeyPress}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row}>
                <Col sm={6}>
                  {user.purch_org !== null && (
                    <Form.Group as={Row} className="mt-5">
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
                    <Form.Group as={Row} className="mt-5">
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
                
          </Form.Group>
        </Form>

        {/* Table */}
        {data && data.length > 0 && (
          <PurchaseOrderTable
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
