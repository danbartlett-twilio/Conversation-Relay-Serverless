const child_process = require("node:child_process");
const path = require("node:path");

const getCloudFormationOuputValue = (key) => {
  const command = `
    aws cloudformation describe-stacks \
        --stack-name CR-RESTAURANT-ORDERING \
        --no-paginate \
        --no-cli-pager \
        --output text \
        --query "Stacks[0].Outputs[?OutputKey=='${key}'].OutputValue"
    `;
  return child_process.execSync(command);
};

const uploadFiles = () => {
  const sourceDir = path.resolve(path.join(__dirname, "../build"));
  const s3BucketName = getCloudFormationOuputValue("WebAppS3BucketName");

  console.log(`Uploading files from ${sourceDir} to s3://${s3BucketName}`);
  child_process.execSync(`aws s3 sync ${sourceDir} s3://${s3BucketName}`, { stdio: "inherit" });
};

// const clearCloudFrontCache = () => {
//   const distributionId = getCloudFormationOuputValue("CloudFrontDistributionId");
//   console.log(`Clearing CloudFront cache for distribution ${distributionId}`);

//   const command = `
//     aws cloudfront create-invalidation \
//         --no-paginate \
//         --no-cli-pager \
//         --paths "/*" \
//         --distribution-id ${distributionId}
//     `;
//   child_process.execSync(command, { stdio: "inherit" });
// };

uploadFiles();
// clearCloudFrontCache();

// const domain = getCloudFormationOuputValue("WebAppDomain");
// console.log(`Deployment done, visit https://${domain}`);