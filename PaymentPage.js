import React, { useEffect, useState } from "react";
import { Button, Form, Col, Row } from "react-bootstrap";
import {
  Card,
  CardBody,
  CardHeader,
} from "../../../../_metronic/_partials/controls";
import { LayoutSplashScreen } from "../../../../_metronic/layout";
import { PaymentTable } from "./PaymentTable";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  resetData,
  selectPayment,
  selectLoading,
  selectPageNo,
  selectPageSize,
  selectTotalRecord,
  fetchPayment,
} from "./paymentSlice";
import { showErrorDialog } from "../../../utility";
import { selectUser } from "../../../modules/Auth/_redux/authRedux";
import LoadingFetchData from "../../../utility/LoadingFetchData";

export const PaymentPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const data = useSelector(selectPayment);
  const user = useSelector(selectUser);
  const loading = useSelector(selectLoading);
  const pageNo = useSelector(selectPageNo);
  const pageSize = useSelector(selectPageSize);
  const totalRecord = useSelector(selectTotalRecord);
  const [overlayLoading, setOverlayLoading] = useState(false);

  useEffect(() => {
    // Reset on first load
    dispatch(resetData());
  }, [dispatch]);

  const filterVendorCode =
    user.vendor_code === null ? vendorCode : user.vendor_code;
  const filterPurOrg =
    user.purch_org === null ? valueNmbr : user.purch_org;

  // Filter;
  const [regNumber, setRegNumber] = useState("");
  const [JVNumber, setJVNumber] = useState("");
  const [paymentDoc, setPaymentDoc] = useState("");
  //const [paymentDate, setPaymentDate] = useState("");
  const [vendorCode, setVendorCode] = useState("");
  const [valueNmbr, setValueNmbr] = useState(""); //buat deklarasi state

  const handleSearch = async () => { //pemanggilan fungsi handle search
    const params = {
      BSAK_LIFNR: filterVendorCode,
      BSAK_XBLNR: regNumber,
      BSAK_BELNR: JVNumber,
      BSAK_AUGBL: paymentDoc,
      purch_org: filterPurOrg, //valueNmbr, //parameter pembacaan u/ melakukan permintaan API 
      pageNo: 1,
      pageSize: 10,
    };
    console.log(params, "params");
    console.log("test value : " + params.value);
    try {
      // Corrected the syntax here
      const response = await dispatch(fetchPayment(params));
      if (response.payload.data.status === 200) {
        setOverlayLoading(false);
      } else if (
        response.payload.data.error === "10008" ||
        response.payload.data.error === "10009"
      ) {
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
        BSAK_LIFNR: filterVendorCode,
        BSAK_XBLNR: regNumber,
        BSAK_BELNR: JVNumber,
        BSAK_AUGBL: paymentDoc,
        purch_org: filterPurOrg, //valueNmbr,
        pageNo: page,
        pageSize: sizePerPage,
      };
      try {
        const response = await dispatch(fetchPayment(params));
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

  return loading ? (
    <LayoutSplashScreen />
  ) : (
    <Card>
      <CardHeader title="Payment"></CardHeader>
      <LoadingFetchData active={overlayLoading} />
      <CardBody>
        {/* Filter */}
        <Form>
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
                  <b>Reg Number</b>
                </Form.Label>
                <Col sm={6}>
                  <Form.Control
                    type="text"
                    placeholder="Reg Number"
                    onChange={(e) => {
                      setRegNumber(e.target.value);
                    }}
                    value={regNumber}
                    onKeyPress={handleKeyPress}
                  />
                </Col>
              </Form.Group>
            </Col>
        
            {/* Right Row */}

            <Col sm={6}>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  <b>Payment Doc</b>
                </Form.Label>
                <Col sm={6}>
                  <Form.Control
                    type="text"
                    placeholder="Payment Doc"
                    onChange={(e) => {
                      setPaymentDoc(e.target.value);
                    }}
                    value={paymentDoc}
                    onKeyPress={handleKeyPress}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  <b>JVNumber</b>
                </Form.Label>
                <Col sm={6}>
                  <Form.Control
                    type="text"
                    placeholder="JVNumber"
                    onChange={(e) => {
                      setJVNumber(e.target.value);
                    }}
                    value={JVNumber}
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
                            setValueNmbr(e.target.value); 
                          }}
                          value={valueNmbr} 
                          onKeyPress={handleKeyPress}
                        />
                      </Col>
                    </Form.Group>
                  )}
                  <Button className="btn btn-danger " onClick={handleSearch}>
                    Search
                  </Button>
                </Col>
              </Form.Group>
            </Col>

          </Form.Group>
        </Form>
    
        {/* Table */}
        {data && data.length > 0 && (
          <PaymentTable
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
