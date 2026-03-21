import { Formik, Field, Form } from "formik";
const ChooseRolePage = () => {
  return (
    <div>
      <div className="w-4/5 lg:w-3/5 justify-between  m-auto">
        <div className=" grid grid-cols-12 h-screen  md:gap-5  lg:gap-0">
          {/* component left */}
          <div className="hidden md:block md:col-span-1  lg:h-4/5 justify-center m-auto">
            <div>
              <img
                className="lg:h-full mt-12"
                src={(require("../../assets/images/Line_chooseRole.png")?.default || require("../../assets/images/Line_chooseRole.png"))}
                alt=""
              />
            </div>
          </div>
          {/* component right */}
          <div className="col-span-12 md:col-span-11 lg:h-full lg:w-11/12 justify-center m-auto">
            <Formik
              initialValues={{
                picked: "",
              }}
              onSubmit={async (values) => {
                // await new Promise((r) => setTimeout(r, 500));
                // alert(JSON.stringify(values, null, 2));
                alert(values);
              }}
            >
              {({ values }) => (
                <Form>
                  <div className="lg:mt-14">
                    <div>
                      <h1 className="text-3xl font-bold text-primaryColor text-center ">
                        Who would you like to become?
                      </h1>
                      <p className="text-gray-500 mt-5 text-center">
                        Are you ready to experience something you have always
                        wanted? Select your role here and started your journey
                        now!
                      </p>
                    </div>
                    <div>
                      <div className="">
                        {/* Distributor */}
                        <label
                          htmlFor="distributor"
                          className="relative flex p-8 mt-10 w-full hover:shadow-primaryColor shadow-md bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400"
                        >
                          <img
                            src={(require("../../assets/images/victory_choose_role.png")?.default || require("../../assets/images/victory_choose_role.png"))}
                            className="absolute top-4 lg:left-10"
                            alt=""
                          />
                          <span className=" text-gray-500 dark:text-gray-400 absolute md:top-5 left-24 lg:left-32">
                            <h1 className="font-bold text-xl">Distributor</h1>
                            <p className="hidden md:block">
                              I'd like to provide the best products to my
                              retailers.
                            </p>
                          </span>
                          <Field
                            type="radio"
                            name="picked"
                            value="distributor"
                            id="distributor"
                            className="shrink-0 ml-auto mt-0.5 border-gray-200 rounded-full text-primaryColor pointer-events-none focus:ring-primaryColor dark:bg-gray-800 dark:border-gray-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                          />
                        </label>
                        {/* Retailer */}
                        <label
                          htmlFor="retailer"
                          className="relative flex p-8 mt-5 lg:mt-10 w-full hover:shadow-primaryColor visited:shadow-primaryColor shadow-md bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400"
                        >
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            <img
                              src={(require("../../assets/images/trolley_choose_role.png")?.default || require("../../assets/images/trolley_choose_role.png"))}
                              className="absolute top-4 lg:left-10"
                              alt=""
                            />
                            <span className=" text-gray-500 dark:text-gray-400 absolute md:top-5 left-24 lg:left-32">
                              <h1 className="font-bold text-xl">Retailer</h1>
                            
                              <p className="hidden md:block">I'd to find a good distributor for my shop.</p>
                            </span>
                          </span>
                          <Field
                            type="radio"
                            name="picked"
                            value="retailer"
                            id="retailer"
                            className="shrink-0 ml-auto mt-0.5 border-gray-200 rounded-full text-primaryColor pointer-events-none focus:ring-primaryColor dark:bg-gray-800 dark:border-gray-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                          />
                        </label>
                      </div>
                    </div>
                    {/* <div>Picked: {values.picked}</div> */}
                  </div>
                  {/* Button */}
                  <div>
                    <button
                      type="submit"
                      className="mt-7 lg:mt-20 inline-block rounded-xl bg-primaryColor w-full py-5  text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-cyan-400 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                      data-te-ripple-init
                      data-te-ripple-color="light"
                    >
                     Continue
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChooseRolePage;
